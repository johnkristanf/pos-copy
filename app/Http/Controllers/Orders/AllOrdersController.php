<?php

namespace App\Http\Controllers\Orders;

use App\Http\Controllers\Controller;
use App\Services\OrdersService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AllOrdersController extends Controller
{
    public function __construct(
        protected OrdersService $ordersService
    ) {}

    public function renderAllOrdersPage(Request $request): Response
    {
        $filters = $request->only(['search', 'search_by', 'date_from', 'date_to', 'customer_id', 'page', 'per_page']);
        $perPage = $request->integer('per_page', 10);

        return Inertia::render('orders/all-orders', [
            'orders' => Inertia::defer(fn () => $this->ordersService->getManyOrders($filters, $perPage)
            ),
            'filters' => $filters,
        ]);
    }
}
