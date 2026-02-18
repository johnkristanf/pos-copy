<?php

namespace App\Services;

use App\Data\Operations\CreateDiscountData;
use App\Data\Operations\DeleteDiscountData;
use App\Data\Operations\UpdateDiscountData;
use App\Models\Discount;
use App\Models\Items;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class DiscountService
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    public function getManyDiscounts(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Discount::query()->withCount('items');

        $this->applyFilters($query, $filters);

        return $query->latest('created_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    protected function applyFilters($query, array $filters): void
    {
        $query->when($filters['search'] ?? null, function ($q, $search) {
            $q->where('name', 'like', '%'.trim($search).'%');
        });

        $query->when($filters['discount_type'] ?? null, function ($q, $type) {
            $q->where('discount_type', $type);
        });

        $query->when($filters['date_from'] ?? null, function ($q, $date) {
            $q->whereDate('start_date', '>=', $date);
        });

        $query->when($filters['date_to'] ?? null, function ($q, $date) {
            $q->whereDate('end_date', '<=', $date);
        });
    }

    public function createDiscount(CreateDiscountData $data): Discount
    {
        return DB::transaction(function () use ($data) {
            $discount = Discount::create([
                'name' => $data->name,
                'description' => $data->description ?? '',
                'discount_type' => $data->discount_type,
                'amount' => $data->amount,
                'min_spend' => $data->min_spend,
                'capped_amount' => $data->capped_amount,
                'min_purchase_qty' => $data->min_purchase_qty,
                'start_date' => $data->start_date,
                'start_time' => $data->start_time,
                'end_date' => $data->end_date,
                'end_time' => $data->end_time,
            ]);

            $this->attachDiscountToItems($discount, $data->item_category_type, $data->category_ids, $data->item_ids);
            $this->notificationService->notify('created new', ['price_and_discount:read'], 'discount', $discount->name);

            return $discount;
        });
    }

    public function updateDiscount(Discount $discount, UpdateDiscountData $data): Discount
    {
        return DB::transaction(function () use ($discount, $data) {
            $discount->fill([
                'name' => $data->name,
                'description' => $data->description ?? '',
                'discount_type' => $data->discount_type,
                'amount' => $data->amount,
                'min_spend' => $data->min_spend,
                'capped_amount' => $data->capped_amount,
                'min_purchase_qty' => $data->min_purchase_qty,
                'start_date' => $data->start_date,
                'start_time' => $data->start_time,
                'end_date' => $data->end_date,
                'end_time' => $data->end_time,
            ])->save();

            $this->attachDiscountToItems($discount, $data->item_category_type, $data->category_ids, $data->item_ids);
            $this->notificationService->notify('updated', ['price_and_discount:read'], 'discount', $discount->name);

            return $discount;
        });
    }

    public function deleteDiscount(DeleteDiscountData $data): void
    {
        $discount = Discount::findOrFail($data->id);
        $name = $discount->name;

        DB::transaction(function () use ($discount, $name) {
            $discount->items()->detach();
            $discount->delete($discount->id);

            $this->notificationService->notify('deleted', ['price_and_discount:read'], 'discount', $name);
        });
    }

    public function attachDiscountToItems($discount, string $itemCategoryType, ?array $categoryIds = [], ?array $itemIds = []): void
    {
        DB::transaction(function () use ($discount, $itemCategoryType, $categoryIds, $itemIds) {
            $idsToSync = match ($itemCategoryType) {
                'select_item' => $itemIds ?? [],
                'select_category' => Items::query()->whereIn('category_id', $categoryIds ?? [])
                    ->pluck('id')
                    ->toArray(),
                'all_item' => Items::query()->pluck('id')->toArray(),
                default => [],
            };

            $discount->items()->sync($idsToSync);
        });
    }
}
