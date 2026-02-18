<?php

namespace App\Http\Controllers\Menu;

use App\Http\Controllers\Controller;
use App\Services\InventoryService;
use App\Services\ItemCategoryService;
use App\Services\StockLocationService;
use App\Services\SupplierService;
use App\Services\UnitOfMeasureService;
use Inertia\Inertia;
use Inertia\Response;

class ProductsController extends Controller
{
    public function __construct(
        protected InventoryService $inventoryService,
        protected ItemCategoryService $categoryService,
        protected SupplierService $supplierService,
        protected UnitOfMeasureService $unitOfMeasureService,
        protected StockLocationService $stockLocationService,
    ) {}

    public function renderProductsPage(): Response
    {
        $filters = request()->only(['search', 'search_by', 'category_id', 'supplier_id',  'location_id']);
        $perPage = request()->integer('per_page', 10);

        return Inertia::render('products', [
            'item_stock' => $this->inventoryService->getTransformedItemsWithPrice($filters, $perPage),
            'category' => Inertia::defer(fn () => $this->categoryService->getAllItemCategories(['id', 'code', 'name'])),
            'supplier' => Inertia::defer(fn () => $this->supplierService->getAllSuppliers(['id', 'name'])),
            'unit_of_measures' => Inertia::defer(fn () => $this->unitOfMeasureService->getAllUnitOfMeasures(['id', 'name'])),
            'location' => Inertia::defer(fn () => $this->stockLocationService->getAllStockLocations(['id', 'name'])),
            'stockLocation' => Inertia::defer(fn () => $this->stockLocationService->getAllStockLocations(['id', 'name'])),
            'filters' => $filters,
        ]);
    }
}
