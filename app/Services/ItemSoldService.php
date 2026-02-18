<?php

namespace App\Services;

use App\Models\Items;
use Illuminate\Pagination\LengthAwarePaginator;

class ItemSoldService
{
    public function getManySoldItems(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Items::with([
            'category:id,name',
            'supplier:id,name',
            'conversion_units:id,item_id,purchase_uom_id,base_uom_id,conversion_factor',
            'conversion_units.purchase_uom:id,name',
            'conversion_units.base_uom:id,name',
            'order_items' => function ($q) {
                $q->with(['serve_locations']);
            },
        ]);

        $this->applyFilters($query, $filters);

        $paginatedItemSold = $query->latest('created_at')
            ->paginate($perPage)
            ->withQueryString()
            ->through(function ($item) {
                $soldUnits = $this->calculateSoldUnits($item);

                unset($item->order_items);

                return $item->toArray() + ['sold_units' => $soldUnits];
            });

        return $paginatedItemSold;
    }

    protected function applyFilters($query, array $filters): void
    {
        $query->when($filters['search'] ?? null, function ($q, $search) {
            $search = trim($search);
            $q->where(function ($query) use ($search) {
                $query->where('description', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('brand', 'like', "%{$search}%");
            });
        })
            ->when($filters['date_from'] ?? null, fn ($q, $date) => $q->whereDate('created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn ($q, $date) => $q->whereDate('created_at', '<=', $date))
            ->when($filters['category_id'] ?? null, fn ($q, $id) => $q->where('category_id', $id))
            ->when($filters['supplier_id'] ?? null, fn ($q, $id) => $q->where('supplier_id', $id))
            ->when($filters['payment_methods_id'] ?? null, function ($q, $id) {
                $q->whereHas('order_items.order', function ($subQuery) use ($id) {
                    $subQuery->where('payment_method_id', $id);
                });
            })
            ->when($filters['location_id'] ?? null, function ($q, $locationId) {
                $q->whereHas('stocks', function ($subQuery) use ($locationId) {
                    $subQuery->where('location_id', $locationId);
                });
            });
    }

    protected function calculateSoldUnits(Items $item): int
    {
        return $item->order_items
            ->map(fn ($orderItem) => $orderItem->serve_locations ? $orderItem->serve_locations->quantity_to_serve : 0)
            ->sum();
    }
}
