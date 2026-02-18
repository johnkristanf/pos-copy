<?php

namespace App\Http\Controllers\Orders;

use App\Http\Controllers\Controller;
use App\Models\Orders;
use App\Services\OrdersService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CancelledOrdersController extends Controller
{
    public function __construct(
        protected OrdersService $ordersService
    ) {}

    public function renderCancelledOrdersPage(Request $request): Response
    {
        $filters = $request->only([
            'search',
            'search_by',
            'date_from',
            'date_to',
            'customer_id',
            'page',
            'per_page',
        ]);

        $perPage = $request->integer('per_page', 10);
        $userId = Auth::id();

        return Inertia::render('orders/cancelled-orders', [
            'filters' => $filters,
            'orders' => Inertia::defer(fn () => $this->ordersService->getOrdersByUserStatus(
                Orders::CANCELLED,
                $userId,
                $filters,
                $perPage
            )
            ),
        ]);
    }
}
