<?php

namespace App\Http\Controllers\Orders;

use App\Http\Controllers\Controller;
use App\Models\Orders;
use App\Services\OrdersService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CompleteOrdersController extends Controller
{
    public function __construct(
        protected OrdersService $ordersService
    ) {}

    public function renderCompleteOrdersPage(Request $request): Response
    {
        $user = Auth::user();
        $filters = $request->only([
            'search',
            'search_by',
            'date_from',
            'date_to',
            'customer_id',
            'page',
            'per_page',
        ]);

        $perPage = $request->input('per_page', 10);

        $orders = $this->ordersService->getOrdersByUserStatus(
            Orders::COMPLETED,
            $user->id,
            $filters,
            $perPage
        );

        return Inertia::render('orders/complete-orders', [
            'orders' => $orders,
            'filters' => $filters,
        ]);
    }
}
