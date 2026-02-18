<?php

namespace App\Http\Controllers\Items;

use App\Data\Items\StockTransferData;
use App\Http\Controllers\Controller;
use App\Services\ItemCategoryService;
use App\Services\ItemsService;
use App\Services\StockLocationService;
use App\Services\StockService;
use App\Services\StockTransferService;
use Inertia\Inertia;
use Inertia\Response;

class StockTransferController extends Controller
{
    public function __construct(
        protected StockService $stockService,
        protected StockTransferService $stockTransferService,
        protected ItemsService $itemsService,
        protected StockLocationService $stockLocationService,
        protected ItemCategoryService $categoryService
    ) {}

    public function renderStrockTransferPage(): Response
    {
        $filters = request()->only(['search', 'source_location_id', 'destination_location_id', 'date_from', 'date_to']);
        $perPage = request()->integer('per_page', 10);

        $items = $this->itemsService->getAllItems(
            ['*'],
            [
                'stocks:id,item_id,location_id,available_quantity,committed_quantity',
                'stocks.location:id,name,tag',
                'category',
                'supplier',
                'conversion_units:id,item_id,purchase_uom_id,base_uom_id,conversion_factor',
                'conversion_units.purchase_uom:id,name',
                'conversion_units.base_uom:id,name',
                'componentBlueprint',
            ]
        );

        $this->stockService->convertItemStockQuantityToMainUom($items);

        return Inertia::render('items/stock-transfer', [
            'stock_transfers' => $this->stockTransferService->getManyStockTransfers($filters, $perPage),
            'items' => Inertia::defer(fn () => $items),
            'stock_location' => Inertia::defer(fn () => $this->stockLocationService->getAllStockLocations(['id', 'name'])),
            'category' => Inertia::defer(fn () => $this->categoryService->getAllItemCategories(['id', 'code', 'name'])),
            'filters' => $filters,
        ]);
    }

    public function stockTransfer(StockTransferData $data)
    {
        $this->stockTransferService->transferStock($data);

        return back()->with('success', 'Stock transferred successfully.');
    }
}
