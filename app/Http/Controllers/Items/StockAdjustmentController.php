<?php

namespace App\Http\Controllers\Items;

use App\Data\Items\StockAdjustData;
use App\Http\Controllers\Controller;
use App\Models\StockAdjustment;
use App\Services\ItemsService;
use App\Services\StockAdjustmentService;
use App\Services\StockLocationService;
use App\Services\StockService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockAdjustmentController extends Controller
{
    public function __construct(
        protected StockService $stockService,
        protected StockAdjustmentService $stockAdjustmentService,
        protected ItemsService $itemsService,
        protected StockLocationService $stockLocationService
    ) {}

    public function renderStockAdjustmentPage(Request $request): Response
    {
        $filters = $request->only([
            'search', 'date_after', 'location_id', 'status',
        ]);

        $perPage = $request->integer('per_page', 10);

        $stockAdjustments = $this->stockAdjustmentService->getManyStockAdjustment(
            $filters,
            $perPage
        );

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

        return Inertia::render('items/adjustment', [
            'stock_adjustments' => $stockAdjustments,
            'filters' => $filters,
            'items' => Inertia::defer(fn () => $items),
            'stock_location' => Inertia::defer(fn () => $this->stockLocationService->getAllStockLocations(['id', 'name'])),
        ]);
    }

    public function create(StockAdjustData $data): RedirectResponse
    {
        $this->stockAdjustmentService->createStockAdjustments($data);

        return back()->with('success', 'Stock adjustment created successfully.');
    }

    public function setChecked(StockAdjustment $stockAdjustment): RedirectResponse
    {
        $this->stockAdjustmentService->setStockAdjustmentToChecked($stockAdjustment);

        return back()->with('success', 'Stock adjustment marked as checked.');
    }

    public function approve(StockAdjustment $stockAdjustment): RedirectResponse
    {
        $this->stockAdjustmentService->approveStockAdjustment($stockAdjustment);

        return back()->with('success', 'Stock adjustment approved.');
    }

    public function reject(StockAdjustment $stockAdjustment): RedirectResponse
    {
        $this->stockAdjustmentService->rejectStockAdjustment($stockAdjustment);

        return back()->with('success', 'Stock adjustment rejected.');
    }
}
