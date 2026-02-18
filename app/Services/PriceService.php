<?php

namespace App\Services;

use App\Data\Items\CreateSellingPriceData;
use App\Data\Items\UpdateSellingPriceData;
use App\Http\Resources\Items\GetDropdownDataResource;
use App\Http\Resources\Items\GetPaginatedPricesResource;
use App\Models\ItemCategory;
use App\Models\Items;
use App\Models\ItemSellingPricesLog;
use App\Models\StockLocation;
use App\Models\Suppliers;
use App\Models\UnitOfMeasure;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PriceService
{
    public function __construct(
        protected InventoryService $inventoryService,
        protected NotificationService $notificationService
    ) {}

    public function getPaginatedPrices(array $filters, int $perPage): LengthAwarePaginator
    {
        $itemStock = $this->inventoryService->getManyItems($filters, $perPage);
        $collection = $itemStock->getCollection();

        if ($collection instanceof EloquentCollection) {
            $collection->load([
                'sellingPrices',
                'category:id,code,name',
                'supplier:id,name',
                'conversion_units:id,item_id,purchase_uom_id,base_uom_id,conversion_factor',
                'conversion_units.purchase_uom:id,name',
                'conversion_units.base_uom:id,name',
                'stocks.stock_location:id,name,tag',
            ]);
        }

        return $itemStock->through(GetPaginatedPricesResource::transform(...));
    }

    public function getDropdownData(): GetDropdownDataResource
    {
        $data = [
            'category' => ItemCategory::select(['id', 'code', 'name'])->orderBy('name')->get(),
            'location' => StockLocation::select(['id', 'name'])->orderBy('name')->get(),
            'supplier' => Suppliers::select('id')->orderBy('name')->get(),
            'unit_of_measures' => UnitOfMeasure::select('id')->orderBy('name')->get(),
            'stockLocation' => StockLocation::select(['id', 'name'])->orderBy('name')->get(),
        ];

        return new GetDropdownDataResource($data);
    }

    public function createSellingPrice(CreateSellingPriceData $data): void
    {
        DB::transaction(function () use ($data) {
            $item = Items::findOrFail($data->item_id);
            $attributes = $data->except('item_id')->toArray();

            $item->sellingPrices()->updateOrCreate(
                ['item_id' => $item->id],
                $attributes
            );

            ItemSellingPricesLog::create([
                'unit_price' => $data->unit_price,
                'wholesale_price' => $data->wholesale_price,
                'credit_price' => $data->credit_price,
                'item_id' => $item->getKey(),
            ]);

            $this->notificationService->notify('created new', ['price_and_discount:read'], 'selling price for', $item->description);
        });
    }

    public function updateSellingPrice(Items $item, UpdateSellingPriceData $data): void
    {
        DB::transaction(function () use ($item, $data) {
            $item->sellingPrices()->updateOrCreate(
                ['item_id' => $item->id],
                $data->toArray()
            );

            ItemSellingPricesLog::create([
                'unit_price' => $data->unit_price,
                'wholesale_price' => $data->wholesale_price,
                'credit_price' => $data->credit_price,
                'item_id' => $item->getKey(),
            ]);

            $this->notificationService->notify('updated', ['price_and_discount:read'], 'selling price for', $item->description);
        });
    }

    public function deleteSellingPrice(Items $item): bool
    {
        return DB::transaction(function () use ($item) {
            $description = $item->description;

            $deleted = $item->sellingPrices()->delete() > 0;

            if ($deleted) {
                $this->notificationService->notify('deleted', ['price_and_discount:read'], 'selling price for', $description);
            }

            return $deleted;
        });
    }
}
