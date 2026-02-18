<?php

namespace App\Http\Controllers\Items;

use App\Data\Items\CreateSellingPriceData;
use App\Data\Items\DetachItemSellingPriceData;
use App\Data\Items\UpdateSellingPriceData;
use App\Http\Controllers\Controller;
use App\Models\Items;
use App\Services\ItemCategoryService;
use App\Services\PriceService;
use App\Services\StockLocationService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PriceController extends Controller
{
    public function __construct(
        protected PriceService $priceService,
        protected ItemCategoryService $categoryService,
        protected StockLocationService $stockLocationService,
    ) {}

    public function renderPricePage(): Response
    {
        $filters = [
            'search' => request()->get('search'),
            'search_by' => request()->get('search_by', 'sku'),
            'category_id' => request()->get('category_id'),
            'supplier_id' => request()->get('supplier_id'),
            'location_id' => request()->get('location_id'),
        ];

        $perPage = request()->integer('per_page', 10);
        $itemPrices = $this->priceService->getPaginatedPrices($filters, $perPage);
        $dropdowns = $this->priceService->getDropdownData();

        return Inertia::render('items/price', [
            'item_price' => $itemPrices,
            'filters' => $filters,
            ...$dropdowns->toArray(request()),
        ]);
    }

    public function attachItemSellingPrice(CreateSellingPriceData $data): RedirectResponse
    {
        $this->priceService->createSellingPrice($data);

        return back()->with('success', 'Selling price attached successfully.');
    }

    public function updateItemSellingPrice(UpdateSellingPriceData $data, Items $item): RedirectResponse
    {
        $this->priceService->updateSellingPrice($item, $data);

        return back()->with('success', 'Selling price updated successfully.');
    }

    public function detachedItemSellingPrice(DetachItemSellingPriceData $data): RedirectResponse
    {
        $item = Items::findOrFail($data->id);
        $deleted = $this->priceService->deleteSellingPrice($item);

        if (! $deleted) {
            return back()->with('error', 'No selling price found to delete.');
        }

        return back()->with('success', 'Selling price deleted successfully.');
    }
}
