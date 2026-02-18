<?php

namespace App\Http\Controllers\Items;

use App\Http\Controllers\Controller;
use App\Services\InventoryService;
use App\Services\ItemCategoryService;
use App\Services\StockLocationService;
use App\Services\SupplierService;
use App\Services\UnitOfMeasureService;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function __construct(
        protected InventoryService $inventoryService,
        protected ItemCategoryService $categoryService,
        protected SupplierService $supplierService,
        protected UnitOfMeasureService $unitOfMeasureService,
        protected StockLocationService $stockLocationService,
    ) {}

    public function renderInventoryPage(): Response
    {
        $filters = request()->only(['search', 'search_by', 'category_id', 'supplier_id', 'location_id']);
        $perPage = request()->integer('per_page', 10);

        return Inertia::render('items/inventory', [
            'item_stock' => $this->inventoryService->getTransformedItems($filters, $perPage),
            'category' => Inertia::defer(fn () => $this->categoryService->getAllItemCategories(['id', 'code', 'name'])),
            'supplier' => Inertia::defer(fn () => $this->supplierService->getAllSuppliers(['id', 'name'])),
            'unit_of_measures' => Inertia::defer(fn () => $this->unitOfMeasureService->getAllUnitOfMeasures(['id', 'name'])),
            'location' => Inertia::defer(fn () => $this->stockLocationService->getAllStockLocations(['id', 'name'])),
            'stockLocation' => Inertia::defer(fn () => $this->stockLocationService->getAllStockLocations(['id', 'name'])),
            'filters' => $filters,
        ]);
    }
}
