<?php

namespace App\Http\Controllers\Items;

use App\Data\Items\AssembleItemData;
use App\Data\Items\CreateItemData;
use App\Data\Items\DeleteItemData;
use App\Data\Items\UpdateItemData;
use App\Http\Controllers\Controller;
use App\Models\Items;
use App\Services\ItemCategoryService;
use App\Services\ItemsService;
use App\Services\StockLocationService;
use App\Services\StockService;
use App\Services\SupplierService;
use App\Services\UnitOfMeasureService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ItemController extends Controller
{
    public function __construct(
        protected ItemsService $itemsService,
        protected StockService $stockService,
        protected ItemCategoryService $categoryService,
        protected StockLocationService $stockLocationService,
        protected SupplierService $supplierService,
        protected UnitOfMeasureService $unitOfMeasureService
    ) {}

    public function renderItemPage(): Response
    {
        $filters = request()->only(['search', 'search_by', 'date_from', 'date_to', 'status', 'category_id', 'supplier_id',
            'location_id']);
        $perPage = request()->integer('per_page', 10);

        return Inertia::render('items/item', [
            'items' => $this->itemsService->getManyItems($filters, $perPage),
            'categories' => Inertia::defer(fn () => $this->categoryService->getAllItemCategories(['id', 'code', 'name'])),
            'location' => Inertia::defer(fn () => $this->stockLocationService->getAllStockLocations(['id', 'name'])),
            'supplier' => Inertia::defer(fn () => $this->supplierService->getAllSuppliers(['id', 'name'])),
            'unit_of_measures' => Inertia::defer(fn () => $this->unitOfMeasureService->getAllUnitOfMeasures(['id', 'name'])),
            'filters' => $filters,
        ]);
    }

    public function createItem(CreateItemData $data): RedirectResponse
    {
        $item = $this->itemsService->createCompleteItem($data);

        if (! $item) {
            return back()->with('error', 'Item already exists.');
        }

        return back()->with('success', 'Item created successfully');
    }

    public function updateItem(UpdateItemData $data, Items $items): RedirectResponse
    {
        $this->itemsService->updateItem($items, $data);

        return back()->with('success', 'Item updated successfully');
    }

    public function deleteItem(DeleteItemData $data): RedirectResponse
    {
        $this->itemsService->deleteItem($data);

        return back()->with('success', 'Item deleted successfully');
    }

    public function assembleItem(AssembleItemData $data): RedirectResponse
    {
        $this->stockService->assembleItem($data);

        return back()->with('success', 'Item assembled successfully');
    }
}
