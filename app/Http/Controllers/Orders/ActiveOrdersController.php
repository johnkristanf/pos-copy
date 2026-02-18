<?php

namespace App\Http\Controllers\Orders;

use App\Data\Orders\ProcessOrderReceiptData;
use App\Data\Orders\ServeOrderData;
use App\Data\Orders\VoidOrderData;
use App\Http\Controllers\Controller;
use App\Models\Orders;
use App\Services\OrdersService;
use App\Services\VoucherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ActiveOrdersController extends Controller
{
    public function __construct(protected OrdersService $ordersService, protected VoucherService $voucherService) {}

    public function renderActiveOrdersPage(Request $request)
    {
        $filters = $request->only(['search', 'search_by', 'date_from', 'date_to', 'customer_id', 'page', 'per_page']);
        $perPage = $request->integer('per_page', 10);
        $userID = Auth::id();

        return Inertia::render('orders/active-orders', [
            'filters' => $filters,
            'orders' => Inertia::defer(fn () => $this->ordersService->getOrdersByUserStatus(Orders::ACTIVE, $userID, $filters, $perPage)
            ),
        ]);
    }

    public function serveOrder(ServeOrderData $data)
    {
        $this->ordersService->serveOrderItem($data);

        return back()->with('success', 'Order item successfully served.');
    }

    public function processOrderReceipt(ProcessOrderReceiptData $data)
    {
        $this->ordersService->processOrderReceipt($data);

        return back()->with('success', 'Order processed successfully!');
    }

    public function voidOrder(VoidOrderData $data)
    {
        $this->ordersService->voidOrder($data);

        return back()->with('success', 'Order has been voided successfully.');
    }

    public function getManyActiveVoucers(): JsonResponse
    {
        return response()->json($this->voucherService->getManyVouchers());
    }
}
