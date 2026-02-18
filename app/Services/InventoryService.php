<?php

namespace App\Services;

use App\Models\Items;
use Illuminate\Pagination\LengthAwarePaginator;

class InventoryService
{
    public function __construct(protected StockService $stockService) {}

    public function getManyItems(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Items::query()->with([
            'category:id,code,name',
            'supplier:id,name',
            'stocks.stock_location:id,tag,name',
            'conversion_units:id,item_id,purchase_uom_id,base_uom_id,conversion_factor',
            'conversion_units.purchase_uom:id,name',
            'sellingPrices:id,item_id,unit_price,wholesale_price,credit_price',
        ]);

        $query->withSum('stocks as total_committed_stocks', 'committed_quantity')
            ->withSum('stocks as total_available_stocks', 'available_quantity');

        $this->applyFilters($query, $filters);

        $paginator = $query->latest('updated_at')
            ->paginate($perPage)
            ->withQueryString();

        $paginator->getCollection()->transform(function ($item) {
            // 1. Transform stocks to use raw values
            if ($item->stocks->isNotEmpty()) {
                $item->setRelation('stocks', $item->stocks->map(function ($stock) {
                    $data = $stock->toArray();
                    $data['available_quantity'] = (float) $stock->getRawOriginal('available_quantity');
                    $data['committed_quantity'] = (float) $stock->getRawOriginal('committed_quantity');

                    return $data;
                }));
            }

            // 2. Calculate total stock from the transformed raw stocks
            $totalAvailableStock = 0;
            if ($item->stocks->isNotEmpty()) {
                $totalAvailable = $item->stocks->sum('available_quantity');
                $totalCommitted = $item->stocks->sum('committed_quantity');
                $totalAvailableStock = max(0, $totalAvailable - $totalCommitted);
            }

            // 3. Process conversion units
            if ($item?->conversion_units?->isNotEmpty()) {
                $conversionUnits = $item->conversion_units->reverse();
                $baseToUomFactorMap = $this->buildConversionFactorMapFromBaseUom($conversionUnits);

                $item->conversion_units->each(function ($conversion) use ($baseToUomFactorMap, $totalAvailableStock) {
                    $uomId = $conversion->purchase_uom_id;
                    // Use calculated map factor, or default to 1 if the UOM is a root/disconnected base
                    $factor = $baseToUomFactorMap[$uomId] ?? (float) $conversion->conversion_factor;

                    $conversion->available_stocks = $factor > 0 ? ($totalAvailableStock / $factor) : 0;
                });
            }

            return $item;
        });

        return $paginator;
    }

    protected function applyFilters($query, array $filters): void
    {
        $searchTerm = trim($filters['search'] ?? '');

        if ($searchTerm !== '') {
            $scoutIds = Items::search($searchTerm)->keys();
            $query->where(function ($q) use ($scoutIds, $searchTerm) {
                $q->whereIn('id', $scoutIds)
                    ->orWhereHas('supplier', function ($subQ) use ($searchTerm) {
                        $subQ->where('name', 'like', "%{$searchTerm}%");
                    });
            });
        }

        $query->when($filters['category_id'] ?? null, fn ($q, $id) => $q->where('category_id', $id))
            ->when($filters['supplier_id'] ?? null, fn ($q, $id) => $q->where('supplier_id', $id))
            ->when($filters['location_id'] ?? null, function ($q, $locationId) {
                $q->whereHas('stocks', function ($subQuery) use ($locationId) {
                    $subQuery->where('location_id', $locationId);
                });
            });
    }

    public function getTransformedItems(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $result = $this->getManyItems($filters, $perPage)->through(fn ($item) => [
            'id' => $item->id,
            'sku' => $item->sku,
            'description' => $item->description,
            'image_url' => $item->image_url,
            'size' => $item->size,
            'brand' => $item->brand,
            'color' => $item->color,
            'min_quantity' => $item->min_quantity,
            'max_quantity' => $item->max_quantity,
            'updatedAt' => $item->updated_at?->toDateTimeString(),
            'category' => $item->category,
            'supplier' => $item->supplier,
            'committed_stocks' => $item->total_committed_stocks,
            'available_stocks' => $item->total_available_stocks,
            'stocks' => $item->stocks->map(function ($stock) {
                return [
                    'available_quantity' => $stock['available_quantity'],
                    'location' => [
                        'id' => $stock['stock_location']['id'],
                        'name' => $stock['stock_location']['name'],
                        'tag' => $stock['stock_location']['tag'],
                    ],
                ];
            }),
            'conversion_units' => $item->conversion_units,
        ]);

        return $result;
    }

    public function getTransformedItemsWithPrice(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return $this->getManyItems($filters, $perPage)->through(function ($item) {
            $sellingPrice = $item->sellingPrices;

            return [
                'id' => $item->id,
                'sku' => $item->sku,
                'description' => $item->description,
                'image_url' => $item->image_url,
                'size' => $item->size,
                'brand' => $item->brand,
                'color' => $item->color,
                'min_quantity' => $item->min_quantity,
                'max_quantity' => $item->max_quantity,
                'updatedAt' => $item->updated_at?->toDateTimeString(),
                'category' => $item->category,
                'supplier' => $item->supplier,
                'committed_stocks' => (float) $item->total_committed_stocks,
                'available_stocks' => (float) $item->total_available_stocks,
                'stocks' => $item->stocks->map(function ($stock) {
                    return [
                        'available_quantity' => $stock['available_quantity'],
                        'location' => [
                            'id' => $stock['stock_location']['id'],
                            'name' => $stock['stock_location']['name'],
                            'tag' => $stock['stock_location']['tag'],
                        ],
                    ];
                }),
                'conversion_units' => $item->conversion_units,
                'unit_price' => $sellingPrice?->unit_price ?? null,
                'wholesale_price' => $sellingPrice?->wholesale_price ?? null,
                'credit_price' => $sellingPrice?->credit_price ?? null,
            ];
        });
    }

    protected function buildConversionFactorMapFromBaseUom($conversionUnits): array
    {
        $conversionMap = [];
        $allPurchaseUomIds = $conversionUnits->pluck('purchase_uom_id')->toArray();
        $trueBaseUomId = null;

        foreach ($conversionUnits as $conversion) {
            $baseUomId = $conversion->base_uom_id;
            if (! \in_array($baseUomId, $allPurchaseUomIds)) {
                $trueBaseUomId = $baseUomId;
                break;
            }
        }

        if ($trueBaseUomId !== null) {
            $conversionMap[$trueBaseUomId] = 1;
        }

        $remainingConversions = $conversionUnits->values();

        while ($remainingConversions->isNotEmpty()) {
            $foundOne = false;

            $remainingConversions = $remainingConversions->reject(function ($conversion) use (&$conversionMap, &$foundOne) {
                $baseUomId = $conversion->base_uom_id;
                $purchaseUomId = $conversion->purchase_uom_id;
                $factor = (float) $conversion->conversion_factor;

                if (isset($conversionMap[$baseUomId]) && $factor > 0 && ! isset($conversionMap[$purchaseUomId])) {
                    $conversionMap[$purchaseUomId] = $conversionMap[$baseUomId] * $factor;
                    $foundOne = true;

                    return true;
                }

                return false;
            });

            if (! $foundOne) {
                $next = $remainingConversions->first();
                if ($next && ! isset($conversionMap[$next->base_uom_id])) {
                    $conversionMap[$next->base_uom_id] = 1;

                    continue;
                }

                break;
            }
        }

        return $conversionMap;
    }
}
