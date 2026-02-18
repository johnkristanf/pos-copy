<?php

namespace App\Services;

use App\Data\Items\AssembleItemData;
use App\Data\Items\CreateItemData;
use App\Data\Items\CreateStockData;
use App\Data\Items\StorePurchasedItemData;
use App\Data\Items\StorePurchasedItemDetailData;
use App\Data\Items\StorePurchasedItemObjectData;
use App\Events\StockInPerformed;
use App\Models\ItemPurchasePricesLog;
use App\Models\Items;
use App\Models\ItemSellingPrice;
use App\Models\Locations;
use App\Models\Purchased;
use App\Models\PurchasedItem;
use App\Models\Stock;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class StockService
{
    public function __construct(
        protected ItemsService $itemService,
        protected ItemCategoryService $categoryService,
        protected SupplierService $supplierService,
        protected UnitOfMeasureService $unitOfMeasureService,
        protected NotificationService $notificationService
    ) {}

    public function storePurchasedItem(StorePurchasedItemData $data): Purchased
    {
        return DB::transaction(function () use ($data) {
            $purchase = $this->createOrUpdatePurchase($data);

            foreach ($data->items as $item) {
                $this->processItemPurchase($purchase, $item);
            }

            $this->notificationService->notify('stored purchased items for', ['inventory:read'], 'purchase order', $data->purchase_order_id);

            return $purchase->fresh('items');
        });
    }

    protected function createOrUpdatePurchase(StorePurchasedItemData $data): Purchased
    {
        $purchase = Purchased::firstOrCreate(
            ['purchase_order_id' => $data->purchase_order_id],
            [
                'received_at' => $data->received_at,
                'acknowledgment_receipt' => $data->acknowledgment_receipt,
                'remarks' => $data->remarks,
            ]
        );

        $purchase->fill([
            'received_at' => $data->received_at,
            'acknowledgment_receipt' => $data->acknowledgment_receipt,
            'remarks' => $data->remarks,
        ])->save();

        return $purchase;
    }

    protected function processItemPurchase(Purchased $purchase, StorePurchasedItemDetailData $item): void
    {
        $purchasedItem = $this->findExistingPurchasedItem($purchase, $item);

        if ($purchasedItem) {
            $this->updateExistingPurchasedItem($purchasedItem, $item);

            return;
        }

        $this->createNewPurchasedItem($purchase, $item);
    }

    protected function findExistingPurchasedItem(Purchased $purchase, StorePurchasedItemDetailData $item): ?PurchasedItem
    {
        return $purchase->items()
            ->where('purchase_order_item_id', $item->purchase_order_item_id)
            ->where('status', '!=', PurchasedItem::STATUS_FULLY_STOCKED_IN)
            ->first();
    }

    protected function updateExistingPurchasedItem(PurchasedItem $purchasedItem, StorePurchasedItemDetailData $item): void
    {
        $purchasedItem->purchased_quantity += $item->quantity;
        $purchasedItem->discount = $item->discount ?? 0;
        $purchasedItem->unit_price = $item->unit_price ?? null;
        $purchasedItem->save();

        if ($item->unit_price !== null && $purchasedItem->item_id) {
            ItemPurchasePricesLog::create([
                'item_id' => $purchasedItem->item_id,
                'unit_price' => $item->unit_price,
            ]);
        }
    }

    protected function createNewPurchasedItem(Purchased $purchase, StorePurchasedItemDetailData $item): void
    {
        $itemObject = $item->item;

        if (! $itemObject) {
            return;
        }

        $fetchedItem = $this->resolveOrCreateItemForPurchase($itemObject);

        $purchasedItem = $purchase->items()->create([
            'purchase_order_item_id' => $item->purchase_order_item_id,
            'purchased_quantity' => $item->quantity,
            'discount' => $item->discount ?? 0,
            'unit_price' => $item->unit_price ?? null,
            'item_id' => $fetchedItem->getKey(),
        ]);

        if ($item->unit_price !== null && $purchasedItem->item_id) {
            ItemPurchasePricesLog::create([
                'item_id' => $purchasedItem->item_id,
                'unit_price' => $item->unit_price,
            ]);
        }

        $this->createPurchaseItemUom($purchasedItem, $itemObject);
    }

    protected function resolveOrCreateItemForPurchase(StorePurchasedItemObjectData $itemObject): Items
    {
        $fetchedItem = Items::query()->where('description', $itemObject->name)->first();

        if ($fetchedItem && $this->hasValidItemRelations($itemObject)) {
            return $fetchedItem;
        }

        return $this->createItemWithDependencies($itemObject);
    }

    protected function hasValidItemRelations(StorePurchasedItemObjectData $itemObject): bool
    {
        $fetchSupplier = $this->supplierService->fetchSupplierByDefiningFields([
            'name' => $itemObject->supplier->name ?? null,
        ]);

        $fetchItemCategory = $this->categoryService->fetchItemCategoryByDefiningFields([
            'code' => $itemObject->category->code ?? null,
            'name' => $itemObject->category->name ?? null,
        ]);

        return $fetchSupplier && $fetchItemCategory;
    }

    protected function createItemWithDependencies(StorePurchasedItemObjectData $itemObject): Items
    {
        $location = $this->createOrGetSupplierLocation($itemObject);
        $supplier = $this->createOrGetSupplier($itemObject, $location);
        $category = $this->createOrGetCategory($itemObject);

        return $this->createItemFromPurchaseData($itemObject, $category, $supplier);
    }

    protected function createOrGetSupplierLocation(StorePurchasedItemObjectData $itemObject): ?Locations
    {
        if (! $itemObject->supplier || ! $itemObject->supplier->location) {
            return null;
        }

        $locationData = $itemObject->supplier->location;

        return Locations::firstOrCreate([
            'country' => $locationData->country,
            'region' => $locationData->region,
            'province' => $locationData->province,
            'municipality' => $locationData->municipality,
            'barangay' => $locationData->barangay,
        ]);
    }

    protected function createOrGetSupplier(StorePurchasedItemObjectData $itemObject, ?Locations $location): mixed
    {
        if (! $itemObject->supplier) {
            return null;
        }

        $supplierData = [
            'name' => $itemObject->supplier->name,
            'email' => $itemObject->supplier->email,
            'contact_person' => $itemObject->supplier->contact_person,
            'contact_no' => $itemObject->supplier->contact_no,
            'telefax' => $itemObject->supplier->telefax,
            'address' => $itemObject->supplier->address,
            'shipping' => $itemObject->supplier->shipping,
            'terms' => $itemObject->supplier->terms,
        ];

        if ($location) {
            $supplierData['location_id'] = $location->getKey();
        }

        return $this->supplierService->getSupplierByNameOrCreate($supplierData);
    }

    protected function createOrGetCategory(StorePurchasedItemObjectData $itemObject): mixed
    {
        if (! $itemObject->category) {
            return null;
        }

        $itemCategoryData = [
            'code' => $itemObject->category->code,
            'name' => $itemObject->category->name,
        ];

        return $this->categoryService->getItemCategoryByCodeOrCreate($itemCategoryData);
    }

    protected function createItemFromPurchaseData(StorePurchasedItemObjectData $itemObject, $category, $supplier): Items
    {
        $itemData = CreateItemData::from([
            'item_unit_type' => 'not_set',
            'description' => $itemObject->name,
            'brand' => $itemObject->brand,
            'color' => $itemObject->color,
            'size' => $itemObject->size,
            'min_quantity' => 0,
            'max_quantity' => 0,
            'category_id' => $category->getKey(),
            'supplier_id' => $supplier->getKey(),
            'image_url' => null,
            'conversion_units' => [],
        ]);

        return $this->itemService->createItem($itemData);
    }

    protected function createPurchaseItemUom(PurchasedItem $purchasedItem, StorePurchasedItemObjectData $itemObject): void
    {
        if (! $itemObject->purchase_uom) {
            return;
        }

        $purchasedItem->purchase_item_uom()->create([
            'code' => $itemObject->purchase_uom->code,
            'name' => $itemObject->purchase_uom->name,
        ]);
    }

    public function stockAdjustByAction(string $action, Stock $stock, float|int $quantity): void
    {

        $previousQty = $stock->available_quantity;

        $stock->available_quantity = match ($action) {
            Stock::INCREASE => $stock->available_quantity + $quantity,
            Stock::DEDUCT => max(0, $stock->available_quantity - $quantity),
            default => throw new \InvalidArgumentException("Invalid adjustment action: $action")
        };

        $stock->save();

    }

    public function fetchItemStockByStockLocationID(int $itemID, int $stockLocationID): ?Stock
    {
        return Stock::query()->where('item_id', $itemID)
            ->where('location_id', $stockLocationID)
            ->with(['items:id,sku', 'items.conversion_units:id,item_id,purchase_uom_id,conversion_factor'])
            ->lockForUpdate()
            ->first();
    }

    public function stockIn(CreateStockData $data): void
    {
        DB::transaction(function () use ($data) {
            $item = $this->resolveItemForStockIn($data);

            $totalQuantity = 0;
            $locationIds = [];

            foreach ($data->stock_locations_qty as $location) {
                $this->updateLocationStock($item, $location, $data->stock_in_uom_id);
                $totalQuantity += (float) $location['quantity'];
                $locationIds[] = $location['id'];
            }

            $item->logActivity(
                logName: 'stock_in',
                description: "Stock In: {$item->description}",
                causer: auth()->user(),
                properties: [
                    'item_id' => $item->id,
                    'sku' => $item->sku,
                    'location_ids' => $locationIds,
                    'quantity_added' => $totalQuantity,
                    'stock_data' => $data->stock_locations_qty,
                ],
                event: 'stock_in'
            );

            $this->notificationService->notify('performed stock in for', ['inventory:read'], 'item', $item->description);
        });
    }

    protected function resolveItemForStockIn(CreateStockData $data): Items
    {
        $item = $this->findOrFetchItem($data);

        if (! $item) {
            $createItemData = CreateItemData::from($data);
            $item = $this->itemService->createCompleteItem($createItemData);
            $this->updateItemSellingPrice($item, $data);

            return $item->fresh(['componentBlueprint', 'conversion_units', 'sellingPrices']);
        }

        $this->updateExistingItem($item, $data);
        $this->handleItemUnitTypeUpdates($item, $data);
        $this->updateItemSellingPrice($item, $data);

        return $item->fresh(['componentBlueprint', 'conversion_units', 'sellingPrices']);
    }

    protected function findOrFetchItem(CreateStockData $data): ?Items
    {
        if (! empty($data->item_id)) {
            return $this->itemService->findItemReferenceById($data->item_id);
        }

        return $this->itemService->fetchItemByDefiningFields($data->toArray());
    }

    protected function updateExistingItem(Items $item, CreateStockData $data): void
    {
        $updateData = [];

        if ($data->description !== null) {
            $updateData['description'] = $data->description;
        }

        if ($data->min_quantity !== null) {
            $updateData['min_quantity'] = $data->min_quantity;
        }

        if ($data->max_quantity !== null) {
            $updateData['max_quantity'] = $data->max_quantity;
        }

        if ($data->category_id !== null) {
            $updateData['category_id'] = $data->category_id;
        }

        if ($data->supplier_id !== null) {
            $updateData['supplier_id'] = $data->supplier_id;
        }

        if ($data->brand !== null) {
            $updateData['brand'] = $data->brand;
        }

        if ($data->color !== null) {
            $updateData['color'] = $data->color;
        }

        if ($data->size !== null) {
            $updateData['size'] = $data->size;
        }

        if (! empty($data->image_url) && \is_string($data->image_url)) {
            $updateData['image_url'] = $data->image_url;
        }

        if (! empty($updateData)) {
            $item->fill($updateData)->save();
        }
    }

    protected function handleItemUnitTypeUpdates(Items $item, CreateStockData $data): void
    {
        if ($data->item_unit_type === Items::SET_UNIT_TYPE) {
            $this->handleSetUnitTypeUpdate($item, $data);

            return;
        }

        if ($data->item_unit_type === Items::NOT_SET_UNIT_TYPE) {
            $this->handleNotSetUnitTypeUpdate($item, $data);

            return;
        }
    }

    protected function handleSetUnitTypeUpdate(Items $item, CreateStockData $data): void
    {
        if (! empty($data->components_blueprint)) {
            $syncData = collect($data->components_blueprint)
                ->mapWithKeys(fn ($component) => [
                    $component['child_item_id'] => ['quantity' => $component['quantity']],
                ])
                ->toArray();

            $item->componentBlueprint()->sync($syncData);
        }

        if ($item->conversion_units()->exists()) {
            $item->conversion_units()->delete();
        }
    }

    protected function handleNotSetUnitTypeUpdate(Items $item, CreateStockData $data): void
    {
        if (! empty($data->conversion_units)) {
            $item->conversion_units()->delete();
            $this->itemService->createItemConversionUnit($item, $data->conversion_units);
        }

        if ($item->componentBlueprint()->exists()) {
            $item->componentBlueprint()->detach();
        }
    }

    protected function updateItemSellingPrice(Items $item, CreateStockData $data): void
    {
        if ($data->unit_price === null) {
            return;
        }

        ItemSellingPrice::updateOrCreate(
            ['item_id' => $item->id],
            ['unit_price' => $data->unit_price]
        );
    }

    protected function updateLocationStock(Items $item, array $location, ?int $uomId = null): void
    {
        $baseQuantity = (float) $location['quantity'];

        if ($item->conversion_units()->exists()) {
            $baseQuantity = ($uomId) ? $this->convertFromUomToBase(
                (float) $location['quantity'],
                $uomId,
                $item->conversion_units
            ) : $this->convertItemQuantityUptoBase(
                (float) $location['quantity'],
                $item->conversion_units
            );
        }

        $stock = Stock::firstOrCreate(
            ['item_id' => $item->id, 'location_id' => $location['id']],
            ['available_quantity' => 0, 'committed_quantity' => 0]
        );

        $stock->increment('available_quantity', $baseQuantity);

        if ($item->componentBlueprint()->exists()) {
            $this->updateOrAttachItemComponentStock($stock, $item->componentBlueprint);
        }

        StockInPerformed::dispatch($stock, (float) $location['quantity'], 'units');
    }

    public function convertFromUomToBase(float $quantity, int $fromUomId, $conversionUnits): float
    {
        $currentUomId = $fromUomId;
        $currentQuantity = $quantity;
        $hasConversion = true;

        while ($hasConversion) {
            $unit = $conversionUnits->firstWhere('purchase_uom_id', $currentUomId);

            if ($unit) {
                $currentQuantity *= (float) $unit->conversion_factor;

                if ($unit->purchase_uom_id === $unit->base_uom_id) {
                    break;
                }

                $currentUomId = $unit->base_uom_id;
            } else {
                $hasConversion = false;
            }
        }

        return $currentQuantity;
    }

    public function convertItemQuantityUptoBase($quantity, $itemConversionUnits): float
    {
        $baseQuantity = (float) $quantity;
        foreach ($itemConversionUnits as $unit) {
            $baseQuantity *= (float) $unit->conversion_factor;
        }

        return $baseQuantity;
    }

    public function updateOrAttachItemComponentStock(Stock $stock, $componentBlueprint): void
    {
        foreach ($componentBlueprint as $component) {
            $qty = $stock->available_quantity * $component->pivot->quantity;
            $stock->itemComponents()->syncWithoutDetaching([
                $component->id => ['quantity' => $qty],
            ]);
        }
    }

    public function setPurchasedItemAsStock(CreateStockData $data): void
    {
        $purchasedItem = PurchasedItem::query()->where('purchase_order_item_id', $data->purchase_order_item_id)
            ->where('status', '!=', PurchasedItem::STATUS_FULLY_STOCKED_IN)
            ->lockForUpdate()
            ->first();

        if (! $purchasedItem) {
            return;
        }

        if ($data->unit_price !== null) {
            $purchasedItem->unit_price = $data->unit_price;
        }

        $totalIncoming = collect($data->stock_locations_qty ?? [])->sum('quantity');
        $remainingNeeded = $purchasedItem->purchased_quantity - ($purchasedItem->stocked_in_quantity ?? 0);

        $quantityToApply = min($totalIncoming, $remainingNeeded);
        $purchasedItem->stocked_in_quantity += $quantityToApply;

        $newStatus = match (true) {
            $purchasedItem->stocked_in_quantity >= $purchasedItem->purchased_quantity => PurchasedItem::STATUS_FULLY_STOCKED_IN,
            $purchasedItem->stocked_in_quantity > 0 => PurchasedItem::STATUS_PARTIALLY_STOCK_IN,
            default => $purchasedItem->getAttribute('status')
        };

        $purchasedItem->setAttribute('status', $newStatus);
        $purchasedItem->save();

        $itemDescription = $purchasedItem->item?->description ?? "#{$purchasedItem->id}";
        $this->notificationService->notify("updated stock status ({$newStatus}) for", ['inventory:read'], 'purchased item', $itemDescription);
    }

    public function getManyPurchasedItems(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return PurchasedItem::query()
            ->with([
                'purchased:id,received_at',
                'item:id,sku,description,brand,color,size,category_id,supplier_id',
                'item.category:id,code,name',
                'item.supplier:id,name',
                'item.conversion_units.purchase_uom:id,name',
                'purchase_item_uom:purchased_item_id,name',
            ])
            ->where('status', '!=', PurchasedItem::STATUS_FULLY_STOCKED_IN)
            ->where('purchased_quantity', '>', 0)
            ->when($filters['search'] ?? null, function ($q, $search) {
                $q->whereHas('item', fn ($iq) => $iq->where('sku', 'like', "%{$search}%")->orWhere('description', 'like', "%{$search}%")
                );
            })
            ->when($filters['received_after'] ?? null, function ($q, $date) {
                $q->whereHas('purchased', fn ($pq) => $pq->where('received_at', '>=', $date));
            })
            ->when($filters['category_id'] ?? null, function ($q, $categoryId) {
                $q->whereHas('item', function ($iq) use ($categoryId) {
                    $iq->where('category_id', $categoryId);
                });
            })
            ->when($filters['supplier_id'] ?? null, function ($q, $supplierId) {
                $q->whereHas('item', function ($iq) use ($supplierId) {
                    $iq->where('supplier_id', $supplierId);
                });
            })
            ->latest('id')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function findStockById(int $id): Stock
    {
        return Stock::findOrFail($id);
    }

    public function convertBaseQuantityToSelectedUom(float $baseQuantity, $conversionUnits, int $selectedUomId): float
    {
        if (! $conversionUnits || $conversionUnits->isEmpty()) {
            return $baseQuantity;
        }

        if ($this->isSelectedUomIDTrueBase($conversionUnits, $selectedUomId)) {
            return $baseQuantity;
        }

        $converted = $baseQuantity;
        foreach ($conversionUnits as $unit) {
            $factor = (float) $unit->conversion_factor;
            if ($factor <= 0) {
                continue;
            }

            $converted /= $factor;
            if ($unit->purchase_uom_id == $selectedUomId) {
                break;
            }

        }

        return $converted;
    }

    public function isSelectedUomIDTrueBase($conversionUnits, $selectedUomId)
    {
        $baseUomIds = collect($conversionUnits)->pluck('base_uom_id')->unique()->toArray();
        $purchaseUomIds = collect($conversionUnits)->pluck('purchase_uom_id')->unique()->toArray();

        // Get "true base" UOM IDs, meaning base_uom_ids that do not appear as purchase_uom_ids
        $trueBaseUomIds = array_diff($baseUomIds, $purchaseUomIds);

        if (in_array($selectedUomId, $trueBaseUomIds)) {
            return true;
        }

        return false;
    }

    public function convertSelectedUOMQuantityToBase(float $quantity, $selectedUomId, $conversionUnits)
    {
        if (! $conversionUnits || ! $selectedUomId || empty($conversionUnits)) {
            return $quantity;
        }

        if ($this->isSelectedUomIDTrueBase($conversionUnits, $selectedUomId)) {
            return $quantity;
        }

        $converted = $quantity;
        $currUomID = $selectedUomId;
        foreach ($conversionUnits as $unit) {
            $factor = (float) $unit->conversion_factor;
            if ($unit->purchase_uom_id === $currUomID && $factor > 0) {
                $converted *= $factor;
                $currUomID = $unit->base_uom_id;
            } else {
                continue; // Skip the current conversion unit
            }
        }

        return $converted;
    }

    public function convertBaseQuantityToMainUom(float $baseQuantity, $conversionUnits)
    {
        $converted = $baseQuantity;

        if (empty($conversionUnits)) {
            return $converted;
        }

        $units = ($conversionUnits instanceof Collection) ? $conversionUnits->all() : $conversionUnits;
        $units = array_reverse($units);

        foreach ($units as $unit) {
            $factor = (float) $unit->conversion_factor;
            if ($factor > 0) {
                $converted /= $factor;
            }
        }

        return $converted;
    }

    public function convertItemStockQuantityToMainUom(Collection $items): void
    {
        $items->transform(function ($item) {
            $stocks = $item->stocks ?? [];

            if ($stocks instanceof Collection) {
                $stocks = $stocks->all();
            }

            $conversionUnits = $item->conversion_units ?? null;

            foreach ($stocks as $idx => $stock) {
                $baseAvailableQty = isset($stock->available_quantity) ? (float) $stock->available_quantity : 0.0;
                $baseCommittedQty = isset($stock->committed_quantity) ? (float) $stock->committed_quantity : 0.0;

                $convertedAvailableQuantity = $this->convertBaseQuantityToMainUom($baseAvailableQty, $conversionUnits);
                $convertedCommittedQuantity = $this->convertBaseQuantityToMainUom($baseCommittedQty, $conversionUnits);

                // Set available_quantity as before, net of committed
                $stock->available_quantity = $convertedAvailableQuantity - $convertedCommittedQuantity;

                // Remove committed_quantity from the returned payload
                unset($stock->committed_quantity);

                $stocks[$idx] = $stock;
            }

            $item->stocks = $stocks;

            return $item;
        });
    }

    public function deductQuantityBasedOnSelectedSource($quantityToDeduct, $deductionSourceType, $deductionSourceID, $itemID, $conversionUnits)
    {
        switch ($deductionSourceType) {
            case config('types.returns_to_supplier.stock'):
                $stock = $this->fetchItemStockByStockLocationID($itemID, $deductionSourceID);

                $baseQuantity = $this->convertItemQuantityUptoBase($quantityToDeduct, $conversionUnits);

                if ($stock) {
                    $this->stockAdjustByAction(Stock::DEDUCT, $stock, $baseQuantity);
                }
                break;
            case config('types.returns_to_supplier.purchase'):
                $purchaseItem = PurchasedItem::query()->where('id', $deductionSourceID)
                    ->where('item_id', $itemID)
                    ->first();

                if ($purchaseItem) {
                    $purchaseItem->decrement(
                        'purchased_quantity',
                        min($quantityToDeduct, $purchaseItem->purchased_quantity)
                    );
                }
                break;
        }
    }

    public function assembleItem(AssembleItemData $data): void
    {
        DB::transaction(function () use ($data) {
            $referenceItem = $this->itemService->findItemReferenceById($data->reference_item_id);
            $totalDesiredQty = $data->desired_quantity;

            $componentMap = $referenceItem->componentBlueprint->keyBy(fn ($item) => $item->pivot->child_item_id);
            $totalItemComponents = collect();

            foreach ($data->selected_stock_ids as $stockId) {
                $stock = $this->findStockById($stockId);
                $selectedStockItemId = $stock->item_id;

                if ($componentMap->has($selectedStockItemId)) {
                    $component = $componentMap->get($selectedStockItemId);
                    /** @var \Illuminate\Database\Eloquent\Relations\Pivot $pivot */
                    $pivot = $component->getRelation('pivot');
                    $componentBlueprintQty = $pivot->getAttribute('quantity');
                    $totalComponentQty = $componentBlueprintQty * $totalDesiredQty;

                    if ($stock->getAttribute('quantity') < $totalComponentQty) {
                        throw new \Exception("Insufficient stock for item ID {$selectedStockItemId}.");
                    }

                    $stock->quantity -= $totalComponentQty;
                    $stock->save();

                    $totalItemComponents->push([
                        'item_id' => $selectedStockItemId,
                        'total_component_qty' => $totalComponentQty,
                    ]);
                }
            }

            $stock = Stock::create([
                'quantity' => $totalDesiredQty,
                'committed_quantity' => 0,
                'location_id' => $data->stock_location_id,
                'item_id' => $referenceItem->id,
            ]);

            foreach ($totalItemComponents as $itemComponent) {
                if (method_exists($stock, 'itemComponents')) {
                    $stock->itemComponents()->syncWithoutDetaching([
                        $itemComponent['item_id'] => ['quantity' => $itemComponent['total_component_qty']],
                    ]);
                }
            }

            $this->notificationService->notify('assembled', ['inventory:read'], 'item', $referenceItem->description);
        });
    }
}
