<?php

namespace App\Http\Controllers\Items;

use App\Http\Controllers\Controller;
use App\Services\ItemCategoryService;
use App\Services\ItemSoldService;
use App\Services\PaymentMethodService;
use App\Services\StockLocationService;
use Inertia\Inertia;
use Inertia\Response;

class ItemSoldController extends Controller
{
    public function __construct(
        protected ItemSoldService $itemSoldService,
        protected ItemCategoryService $categoryService,
        protected StockLocationService $stockLocationService,
        protected PaymentMethodService $paymentMethodService,
    ) {}

    public function renderItemSoldPage(): Response
    {
        $filters = request()->only(['search', 'date_from', 'date_to', 'category_id', 'supplier_id', 'location_id', 'payment_methods_id']);
        $perPage = request()->integer('per_page', 10);

        return Inertia::render('items/item-sold', [
            'sold_items' => $this->itemSoldService->getManySoldItems($filters, $perPage),
            'filters' => $filters,
            'categories' => Inertia::defer(fn () => $this->categoryService->getAllItemCategories(['id', 'code', 'name'])),
            'location' => Inertia::defer(fn () => $this->stockLocationService->getAllStockLocations(['id', 'name'])),
            'payment_methods' => Inertia::defer(fn () => $this->paymentMethodService->getAllPaymentMethods(['id', 'name'])),
        ]);
    }
}
