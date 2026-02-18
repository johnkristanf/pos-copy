<?php

namespace App\Http\Controllers\Menu;

use App\Data\Orders\CreateOrderData;
use App\Http\Controllers\Controller;
use App\Services\CustomersService;
use App\Services\ItemsService;
use App\Services\OrdersService;
use App\Services\PaymentMethodService;
use App\Services\StockService;
use App\Services\UnitOfMeasureService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CreateOrderController extends Controller
{
    public function __construct(
        private readonly ItemsService $itemsService,
        private readonly UnitOfMeasureService $unitOfMeasureService,
        private readonly PaymentMethodService $paymentMethodService,
        private readonly CustomersService $customersService,
        protected OrdersService $ordersService,
        protected StockService $stockService
    ) {}

    public function renderCreateOrderPage(Request $request): Response
    {
        $filters = $request->only([
            'search', 'search_by', 'category_id', 'location_id', 'status', 'sort_by', 'sort_order',
        ]);

        $filters['has_stock_and_price'] = true;

        $perPage = $request->integer('per_page', 10);
        $items = $this->itemsService->getManyItems($filters, $perPage);

        $this->stockService->convertItemStockQuantityToMainUom($items->getCollection());

        return Inertia::render('create-order', [
            'filters' => $filters,
            'items' => $items,
            'categories' => Inertia::defer($this->itemsService->getItemCategories(...)),
            'unit_of_measures' => Inertia::defer($this->unitOfMeasureService->getAllUnitOfMeasures(...)),
            'payment_methods' => Inertia::defer($this->paymentMethodService->getAllPaymentMethods(...)),
        ]);
    }

    public function createOrder(CreateOrderData $data): RedirectResponse
    {
        $this->ordersService->createCompleteOrder($data);

        return back()->with('success', 'Order created successfully.');
    }

    public function searchCustomers(Request $request): JsonResponse
    {
        $filters = ['search' => $request->get('query'), 'search_by' => 'general'];

        return response()->json($this->customersService->getManyCustomers($filters, 10));
    }

    public function getDrafts(): JsonResponse
    {
        return response()->json($this->ordersService->getDraftOrders());
    }
}
