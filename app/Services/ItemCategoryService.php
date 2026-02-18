<?php

namespace App\Services;

use App\Data\Items\CreateCategoryData;
use App\Data\Items\GetManyCategoriesData;
use App\Data\Items\UpdateCategoryData;
use App\Models\ItemCategory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ItemCategoryService
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    public function getManyCategories(GetManyCategoriesData $data): LengthAwarePaginator
    {
        $search = trim($data->search ?? '');

        return ItemCategory::query()
            ->withCount('items')
            ->when($search !== '', function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            })
            ->latest('created_at')
            ->paginate($data->per_page)
            ->withQueryString();
    }

    public function getAllItemCategories(array $columns = ['id', 'name', 'code']): Collection
    {
        return ItemCategory::query()
            ->select($columns)
            ->orderBy('name')
            ->get();
    }

    public function createCategory(CreateCategoryData $data): ItemCategory
    {
        return DB::transaction(function () use ($data) {
            $category = ItemCategory::create($data->toArray());

            $this->notificationService->notify('created new', ['item_management:read'], 'item category', $category->name);

            return $category;
        });
    }

    public function updateCategory(ItemCategory $category, UpdateCategoryData $data): bool
    {
        return DB::transaction(function () use ($category, $data) {
            $updated = $category->fill($data->toArray())->save();

            if ($updated) {
                $this->notificationService->notify('updated', ['item_management:read'], 'item category', $category->name);
            }

            return $updated;
        });
    }

    public function deleteCategory(ItemCategory $category): ?bool
    {
        return DB::transaction(function () use ($category) {
            $name = $category->name;

            $deleted = ItemCategory::destroy($category->id) > 0;

            if ($deleted) {
                $this->notificationService->notify('deleted', ['item_management:read'], 'item category', $name);
            }

            return $deleted;
        });
    }

    public function getItemCategoryByCodeOrCreate(array $data): ItemCategory
    {
        return ItemCategory::firstOrCreate(
            ['code' => $data['code']],
            ['name' => $data['name'] ?? null]
        );
    }

    public function fetchItemCategoryByDefiningFields(array $data): ?ItemCategory
    {
        return ItemCategory::query()
            ->where([
                'code' => $data['code'] ?? null,
                'name' => $data['name'] ?? null,
            ])
            ->first();
    }
}
