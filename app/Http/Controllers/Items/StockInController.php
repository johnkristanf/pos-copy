<?php

namespace App\Http\Controllers\Items;

use App\Data\Items\CreateStockData;
use App\Http\Controllers\Controller;
use App\Services\ItemCategoryService;
use App\Services\ItemsService;
use App\Services\StockLocationService;
use App\Services\StockService;
use App\Services\SupplierService;
use App\Services\UnitOfMeasureService;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StockInController extends Controller
{
    public function __construct(
        protected StockService $stockService,
        protected ItemCategoryService $categoryService,
        protected SupplierService $supplierService,
        protected ItemsService $itemsService,
        protected UnitOfMeasureService $unitOfMeasureService,
        protected StockLocationService $stockLocationService,
    ) {}

    public function renderStockInPage(): Response
    {
        $filters = request()->only(['search', 'search_by', 'date_from', 'date_to', 'category_id', 'status', 'location_id']);
        $perPage = request()->integer('per_page', 10);

        $allItems = $this->itemsService->getAllItems(
            ['*'],
            ['stocks:id,item_id,location_id,available_quantity,committed_quantity', 'stocks.location:id,name,tag', 'category', 'supplier', 'conversion_units', 'componentBlueprint', 'sellingPrices']
        );

        $this->stockService->convertItemStockQuantityToMainUom($allItems);

        return Inertia::render('items/stock-in', [
            'purchased_items' => $this->stockService->getManyPurchasedItems($filters, $perPage),
            'items' => Inertia::defer(fn () => $allItems),
            'category' => Inertia::defer(fn () => $this->categoryService->getAllItemCategories(['id', 'code', 'name'])),
            'supplier' => Inertia::defer(fn () => $this->supplierService->getAllSuppliers(['id', 'name'])),
            'unit_of_measures' => Inertia::defer(fn () => $this->unitOfMeasureService->getAllUnitOfMeasures(['id', 'name'])),
            'stockLocation' => Inertia::defer(fn () => $this->stockLocationService->getAllStockLocations(['id', 'name'])),
            'location' => Inertia::defer(fn () => $this->stockLocationService->getAllStockLocations(['id', 'name'])),
            'filters' => $filters,
        ]);
    }

    public function createStock(CreateStockData $data)
    {
        return DB::transaction(function () use ($data) {
            $this->linkPurchasedItemIfPresent($data);
            $this->stockService->stockIn($data);

            return back()->with('success', 'Stock created successfully.');
        });
    }

    protected function linkPurchasedItemIfPresent(CreateStockData $data): void
    {
        if (empty($data->purchase_order_item_id)) {
            return;
        }

        $this->stockService->setPurchasedItemAsStock($data);
    }
}
