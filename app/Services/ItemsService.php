<?php

namespace App\Services;

use App\Data\Items\CreateItemData;
use App\Data\Items\DeleteItemData;
use App\Data\Items\UpdateItemData;
use App\Models\BlobAttachments;
use App\Models\ItemCategory;
use App\Models\Items;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ItemsService
{
    public function __construct(
        protected BlobAttachmentsService $blobAttachmentsService,
        protected NotificationService $notificationService
    ) {}

    public function getAllItems(array $columns = ['*'], array $relations = []): Collection
    {
        return Items::query()
            ->select($columns)
            ->with($relations)
            ->orderBy('description')
            ->get();
    }

    public function getItemCategories(): Collection
    {
        return ItemCategory::select('id')->orderBy('name')->get();
    }

    public function getManyItems(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $search = trim($filters['search'] ?? '');
        $loadRelations = [
            'category:id,name',
            'supplier:id,name',
            'sellingPrices:id,item_id,unit_price,wholesale_price,credit_price',
            'conversion_units:id,item_id,purchase_uom_id,base_uom_id,conversion_factor',
            'conversion_units.purchase_uom:id,name,code',
            'conversion_units.base_uom:id,name,code',
            'stocks.location:id,name',
            'blobAttachments:id,item_id,file_url',
        ];

        $queryCallback = function ($query) use ($loadRelations, $filters) {
            $query->with($loadRelations)
                ->withSum('stocks as total_available_stock', 'available_quantity')
                ->withSum('stocks as total_committed_stock', 'committed_quantity');

            $this->applyFilters($query, $filters);
        };

        if ($search) {
            $paginator = Items::search($search)
                ->query($queryCallback)
                ->paginate($perPage)
                ->withQueryString();
        } else {
            $query = Items::query();
            $queryCallback($query);
            $paginator = $query->latest('created_at')->paginate($perPage)->withQueryString();
        }

        $paginator->getCollection()->transform(function ($item) {
            $item->stocks_price_per_uom = $this->calculateStocksAndPricePerUom($item);

            return $item;
        });

        return $paginator;
    }

    protected function calculateStocksAndPricePerUom(Items $item): array
    {
        $totalAvailableStock = max(0, $item->stocks->sum('available_quantity') - $item->stocks->sum('committed_quantity'));

        if (! $item->conversion_units || $item->conversion_units->isEmpty()) {
            return [];
        }

        $stocksPricePerUom = [];

        $conversionUnits = $item->conversion_units->reverse();
        $baseToUomFactorMap = $this->buildConversionFactorMapFromBaseUom($conversionUnits);
        $mainToUomFactorMap = $this->buildConversionFactorMapFromMainUom($conversionUnits);

        $sellingPrices = $item->sellingPrices;
        $mainUnitPrice = $sellingPrices ? (float) ($sellingPrices->unit_price ?? 0) : 0;
        $mainWholesalePrice = $sellingPrices ? (float) ($sellingPrices->wholesale_price ?? 0) : 0;
        $mainCreditPrice = $sellingPrices ? (float) ($sellingPrices->credit_price ?? 0) : 0;

        foreach ($conversionUnits as $conversion) {

            $purchaseUom = $conversion->purchase_uom;
            $baseUom = $conversion->base_uom;
            $conversionFactor = (float) $conversion->conversion_factor;

            if ($conversionFactor > 0) {
                $baseToPurchaseFactor = $baseToUomFactorMap[$purchaseUom->id] ?? $conversionFactor;
                $stockInPurchaseUom = $totalAvailableStock / $baseToPurchaseFactor;
                $purchaseUomConversionFactor = $mainToUomFactorMap[$purchaseUom->id] ?? 1;

                $stocksPricePerUom[] = [
                    'uom_id' => $purchaseUom->id,
                    'uom_name' => $purchaseUom->name,
                    'uom_code' => $purchaseUom->code,
                    'available_quantity' => $stockInPurchaseUom,
                    'type' => 'purchase_uom',
                    'unit_price' => round($mainUnitPrice * $purchaseUomConversionFactor, 2),
                    'wholesale_price' => round($mainWholesalePrice * $purchaseUomConversionFactor, 2),
                    'credit_price' => round($mainCreditPrice * $purchaseUomConversionFactor, 2),
                ];
            }

            $baseUomConversionFactor = $mainToUomFactorMap[$baseUom->id] ?? 1;

            $stocksPricePerUom[] = [
                'uom_id' => $baseUom->id,
                'uom_name' => $baseUom->name,
                'uom_code' => $baseUom->code,
                'available_quantity' => $totalAvailableStock,
                'available_quantity_precise' => $totalAvailableStock,
                'type' => 'base_uom',
                'unit_price' => round($mainUnitPrice * $baseUomConversionFactor, 2),
                'wholesale_price' => round($mainWholesalePrice * $baseUomConversionFactor, 2),
                'credit_price' => round($mainCreditPrice * $baseUomConversionFactor, 2),
            ];
        }

        $uniqueStocks = collect($stocksPricePerUom)->unique('uom_id')->values()->all();

        return $uniqueStocks;
    }

    /**
     * Build a map of conversion factors from base UOM to each UOM
     * Used for calculating stock quantities (stock is stored in base UOM)
     *
     * @param  \Illuminate\Support\Collection  $conversionUnits
     * @return array Array mapping uom_id => conversion_factor_from_base (e.g., 35000 for Box if G is base)
     */
    protected function buildConversionFactorMapFromBaseUom($conversionUnits): array
    {
        $conversionMap = [];

        // Find the actual base UOM (the one that appears as base_uom but never as purchase_uom)
        $allPurchaseUomIds = $conversionUnits->pluck('purchase_uom_id')->toArray();

        // The true base UOM is one that appears as base_uom but never as purchase_uom
        $trueBaseUomId = null;
        foreach ($conversionUnits as $conversion) {
            $baseUomId = $conversion->base_uom_id;
            if (! in_array($baseUomId, $allPurchaseUomIds)) {
                $trueBaseUomId = $baseUomId;
                break;
            }
        }

        // If we couldn't find a true base, use the last base_uom in the reversed list
        if ($trueBaseUomId === null && $conversionUnits->isNotEmpty()) {
            $trueBaseUomId = $conversionUnits->last()->base_uom_id;
        }

        // Base UOM has conversion factor of 1
        if ($trueBaseUomId !== null) {
            $conversionMap[$trueBaseUomId] = 1;
        }

        // Build conversion chain from base to each UOM
        // Process conversion units iteratively until all are processed
        $remainingConversions = $conversionUnits->values();

        while ($remainingConversions->isNotEmpty()) {
            $foundOne = false;

            $remainingConversions = $remainingConversions->reject(function ($conversion) use (&$conversionMap, &$foundOne) {
                $baseUomId = $conversion->base_uom_id;
                $purchaseUomId = $conversion->purchase_uom_id;
                $factor = (float) $conversion->conversion_factor;

                // If we know the conversion factor for the base UOM, we can calculate for purchase UOM
                if (isset($conversionMap[$baseUomId]) && $factor > 0) {
                    // Prevent overwriting if already set to avoid infinite loops in circular references
                    if (! isset($conversionMap[$purchaseUomId])) {
                        $conversionMap[$purchaseUomId] = $conversionMap[$baseUomId] * $factor;
                        $foundOne = true;

                        return true; // Remove this conversion from remaining
                    }
                }

                return false; // Keep this conversion for next iteration
            });

            // If we didn't make progress, check for disconnected chains or circular dependencies
            if (! $foundOne) {
                // If we have remaining conversions but no progress, it means we have a disconnected component.
                // We pick the base UOM of the first remaining conversion as a new "root" (factor 1).
                $next = $remainingConversions->first();
                if ($next && ! isset($conversionMap[$next->base_uom_id])) {
                    $conversionMap[$next->base_uom_id] = 1;

                    // Continue the loop to process this new chain
                    continue;
                }

                break;
            }
        }

        return $conversionMap;
    }

    /**
     * Build a map of conversion factors from main UOM (purchase UOM) to each UOM
     * Prices are stored per main UOM, so we need to divide by conversion factors
     *
     * @param  \Illuminate\Support\Collection  $conversionUnits
     * @return array Array mapping uom_id => conversion_factor_from_main (fraction, e.g., 1/35 for KG if Box is main)
     */
    protected function buildConversionFactorMapFromMainUom($conversionUnits): array
    {
        $conversionMap = [];

        // Find the main/purchase UOM (the one that appears as purchase_uom but never as base_uom)
        $allBaseUomIds = $conversionUnits->pluck('base_uom_id')->toArray();

        // The main UOM is one that appears as purchase_uom but never as base_uom
        $mainUomId = null;
        foreach ($conversionUnits as $conversion) {
            $purchaseUomId = $conversion->purchase_uom_id;
            if (! in_array($purchaseUomId, $allBaseUomIds)) {
                $mainUomId = $purchaseUomId;
                break;
            }
        }

        // If we couldn't find a main UOM, use the first purchase_uom in the list
        if ($mainUomId === null && $conversionUnits->isNotEmpty()) {
            $mainUomId = $conversionUnits->first()->purchase_uom_id;
        }

        // Main UOM has conversion factor of 1 (prices are stored per this UOM)
        if ($mainUomId !== null) {
            $conversionMap[$mainUomId] = 1;
        }

        // Build conversion chain from main UOM to each UOM
        // We need to traverse down the chain, dividing by conversion factors
        $remainingConversions = $conversionUnits->values();

        while ($remainingConversions->isNotEmpty()) {
            $foundOne = false;

            $remainingConversions = $remainingConversions->reject(function ($conversion) use (&$conversionMap, &$foundOne) {
                $purchaseUomId = $conversion->purchase_uom_id;
                $baseUomId = $conversion->base_uom_id;
                $factor = (float) $conversion->conversion_factor;

                // If we know the conversion factor for the purchase UOM, we can calculate for base UOM
                if (isset($conversionMap[$purchaseUomId]) && $factor > 0) {
                    $conversionMap[$baseUomId] = $conversionMap[$purchaseUomId] / $factor;
                    $foundOne = true;

                    return true; // Remove this conversion from remaining
                }

                return false; // Keep this conversion for next iteration
            });

            // If we didn't make progress, break to avoid infinite loop
            if (! $foundOne) {
                break;
            }
        }

        return $conversionMap;
    }

    protected function applyFilters($query, array $filters): void
    {
        $query->when($filters['date_from'] ?? null, fn ($q, $date) => $q->whereDate('created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn ($q, $date) => $q->whereDate('created_at', '<=', $date))
            ->when($filters['category_id'] ?? null, fn ($q, $id) => $q->where('category_id', $id))
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($filters['has_stock_and_price'] ?? null, function ($q) {
                $q->whereHas('stocks', function ($query) {
                    $query->where('available_quantity', '>', 0);
                })->whereHas('sellingPrices', function ($query) {
                    $query->where('unit_price', '>', 0);
                });
            })
            ->when($filters['price_status'] ?? null, function ($q, $status) {
                if ($status === 'unpriced') {
                    $q->whereHas('stocks', function ($query) {
                        $query->where('available_quantity', '>', 0);
                    })
                        ->whereDoesntHave('sellingPrices', function ($query) {
                            $query->where('unit_price', '>', 0)
                                ->where('wholesale_price', '>', 0)
                                ->where('credit_price', '>', 0);
                        });
                }
            });
    }

    public function createCompleteItem(CreateItemData $data): ?Items
    {
        $existingItem = $this->fetchItemByDefiningFields([
            'description' => $data->description,
            'brand' => $data->brand,
            'color' => $data->color,
            'size' => $data->size,
            'category_id' => $data->category_id,
            'supplier_id' => $data->supplier_id,
        ]);

        if ($existingItem) {
            return null;
        }

        return DB::transaction(function () use ($data) {
            $item = $this->createItem($data);
            $this->handleItemImageAttachment($item, $data->image_url, $data->blob_attachment_id);
            $this->handleComponentBlueprint($item, $data);
            $this->handleConversionUnits($item, $data);
            $this->handleSellingPrice($item, $data);

            $this->notificationService->notify('created new', ['item_management:read'], 'item', $item->description);

            return $item;
        });
    }

    protected function handleItemImageAttachment(Items $item, string|UploadedFile|null $imageFile, ?int $blobAttachmentId): void
    {
        if ($imageFile instanceof UploadedFile) {
            $attachment = $this->blobAttachmentsService->uploadBlobAttachmentById($item->id, $imageFile);
            $item->image_url = $attachment->getAttribute('file_url');
            $item->save();

            return;
        }

        if (\is_string($imageFile) && ! empty($imageFile)) {
            $item->image_url = $imageFile;
            $item->save();
        }

        if (empty($blobAttachmentId)) {
            return;
        }

        try {
            $attachment = $this->blobAttachmentsService->getBlobAttachmentById($blobAttachmentId);
            $attachment->item_id = $item->id;
            $attachment->save();
            $item->image_url = $attachment->getAttribute('file_url');
            $item->save();
        } catch (\Exception $e) {
            Log::error("Failed to link blob attachment {$blobAttachmentId} to item {$item->id}: ".$e->getMessage());
        }
    }

    protected function handleComponentBlueprint(Items $item, CreateItemData $data): void
    {
        if ($data->item_unit_type !== Items::SET_UNIT_TYPE) {
            return;
        }

        if (empty($data->components_blueprint)) {
            return;
        }

        $this->attachComponentBlueprint($item, $data->components_blueprint);
    }

    protected function handleConversionUnits(Items $item, CreateItemData $data): void
    {
        if ($data->item_unit_type !== Items::NOT_SET_UNIT_TYPE) {
            return;
        }

        if (empty($data->conversion_units)) {
            return;
        }

        $this->createItemConversionUnit($item, $data->conversion_units);
    }

    protected function handleSellingPrice(Items $item, CreateItemData $data): void
    {
        if (! isset($data->unit_price)) {
            return;
        }

        $this->attachItemSellingPrice($item, ['unit_price' => $data->unit_price]);
    }

    public function generateItemSku(string $categoryName, int $categoryId): string
    {
        $prefix = strtoupper(substr($categoryName, 0, 3));
        $prefix = str_pad($prefix, 3, 'X');

        $lastItem = Items::query()
            ->where('category_id', $categoryId)
            ->orderByDesc('id')
            ->first();

        $nextNumber = $lastItem ? $lastItem->id + 1 : 1;

        return "{$prefix}-000-{$nextNumber}";
    }

    public function createItem(CreateItemData $data): Items
    {
        $category = ItemCategory::query()->findOrFail($data->category_id);
        $sku = $this->generateItemSku($category->getAttribute('name'), $category->getKey());

        return Items::create([
            'image_url' => null,
            'sku' => $sku,
            'description' => $data->description,
            'brand' => $data->brand,
            'color' => $data->color,
            'size' => $data->size,
            'min_quantity' => $data->min_quantity,
            'max_quantity' => $data->max_quantity,
            'category_id' => $data->category_id,
            'supplier_id' => $data->supplier_id,
        ]);
    }

    public function fetchItemByDefiningFields(array $validated)
    {
        return Items::query()->where([
            'description' => $validated['description'] ?? null,
            'brand' => $validated['brand'] ?? null,
            'color' => $validated['color'] ?? null,
            'size' => $validated['size'] ?? null,
            'category_id' => $validated['category_id'],
            'supplier_id' => $validated['supplier_id'],
        ])->first();
    }

    public function createItemConversionUnit(Items $item, array $conversionUnits)
    {
        $data = collect($conversionUnits)->map(fn ($unit) => Arr::only($unit, ['purchase_uom_id', 'base_uom_id', 'conversion_factor']))->toArray();

        $item->conversion_units()->createMany($data);
    }

    public function attachItemSellingPrice(Items $items, array $sellingPrices)
    {
        $items->sellingPrices()->create($sellingPrices);
    }

    public function attachComponentBlueprint(Items $item, array $itemComponents)
    {
        $syncData = collect($itemComponents)->mapWithKeys(fn ($component) => [$component['child_item_id'] => ['quantity' => $component['quantity']]])->toArray();

        if (! empty($syncData)) {
            $item->componentBlueprint()->attach($syncData);
        }
    }

    public function updateItem(Items $items, UpdateItemData $data): Items
    {
        return DB::transaction(function () use ($items, $data) {
            $oldImageUrl = $items->image_url;

            $items->fill([
                'description' => $data->description,
                'category_id' => $data->category_id,
                'supplier_id' => $data->supplier_id,
                'min_quantity' => $data->min_quantity,
                'max_quantity' => $data->max_quantity,
                'brand' => $data->brand,
                'color' => $data->color,
                'size' => $data->size,
            ])->save();

            if ($data->image_url !== null && $data->image_url !== $oldImageUrl) {
                $this->deleteOldImageAttachment($oldImageUrl);
                $this->linkNewBlobAttachment($items, $data->blob_attachment_id);
            } elseif ($data->image_url === null && $oldImageUrl !== null) {
            }

            $this->handleConversionUnitsUpdate($items, $data->conversion_units);
            $this->handleComponentBlueprintUpdate($items, $data->components_blueprint);

            $this->notificationService->notify('updated', ['item_management:read'], 'item', $items->description);

            return $items->fresh(['category']);
        });
    }

    protected function deleteOldImageAttachment(?string $oldImageUrl): void
    {
        if (! $oldImageUrl) {
            return;
        }

        $oldAttachment = BlobAttachments::query()->where('file_url', $oldImageUrl)->first();

        if (! $oldAttachment) {
            return;
        }

        try {
            $this->blobAttachmentsService->deleteBlobAttachmentById($oldAttachment->id);
        } catch (\Exception $e) {
            Log::warning('Failed to delete old item image: '.$e->getMessage());
        }
    }

    protected function linkNewBlobAttachment(Items $items, ?int $blobAttachmentId): void
    {
        if (empty($blobAttachmentId)) {
            return;
        }

        try {
            $attachment = $this->blobAttachmentsService->getBlobAttachmentById($blobAttachmentId);
            $attachment->item_id = $items->id;
            $attachment->save();

            if ($items->image_url === $attachment->getAttribute('file_url')) {
                return;
            }

            $items->image_url = $attachment->getAttribute('file_url');
            $items->save();
        } catch (\Exception $e) {
            Log::error("Failed to link blob attachment {$blobAttachmentId} to item {$items->id}: ".$e->getMessage());
        }
    }

    protected function handleConversionUnitsUpdate(Items $items, ?array $conversionUnitsData): void
    {
        if ($items->conversion_units()->exists()) {
            $items->conversion_units()->delete();
        }

        if (empty($conversionUnitsData)) {
            return;
        }

        $this->createItemConversionUnit($items, $conversionUnitsData);
    }

    protected function handleComponentBlueprintUpdate(Items $items, ?array $componentBlueprintData): void
    {
        if ($componentBlueprintData === null) {
            $items->componentBlueprint()->detach();

            return;
        }

        $syncData = collect($componentBlueprintData)
            ->mapWithKeys(fn ($component) => [
                $component['child_item_id'] => ['quantity' => $component['quantity']],
            ])
            ->toArray();

        $items->componentBlueprint()->sync($syncData);
    }

    public function deleteItem(DeleteItemData $data): bool
    {
        $item = Items::findOrFail($data->id);

        return DB::transaction(function () use ($item) {
            $this->deleteItemImageAttachment($item);
            $this->deleteItemConversionUnits($item);
            $this->detachItemComponentBlueprints($item);
            $this->deleteItemSellingPrices($item);

            return Items::destroy($item->id) > 0;
        });
    }

    protected function deleteItemImageAttachment(Items $item): void
    {
        if (! $item->image_url) {
            return;
        }

        $attachment = BlobAttachments::query()->where('file_url', $item->image_url)->first();

        if (! $attachment) {
            return;
        }

        try {
            $this->blobAttachmentsService->deleteBlobAttachmentById($attachment->id);
        } catch (\Exception $e) {
            Log::warning('Failed to delete item image during item deletion: '.$e->getMessage());
        }
    }

    protected function deleteItemConversionUnits(Items $item): void
    {
        if (! $item->conversion_units()->exists()) {
            return;
        }

        $item->conversion_units()->delete();
    }

    protected function detachItemComponentBlueprints(Items $item): void
    {
        if (! $item->componentBlueprint()->exists()) {
            return;
        }

        $item->componentBlueprint()->detach();
    }

    protected function deleteItemSellingPrices(Items $item): void
    {
        if (! $item->sellingPrices()->exists()) {
            return;
        }

        $item->sellingPrices()->delete();
    }

    public function findItemReferenceById(int $id): Items
    {
        return Items::with(['componentBlueprint', 'conversion_units'])->findOrFail($id);
    }
}
