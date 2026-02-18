<?php

namespace App\Http\Controllers\Orders;

use App\Data\Orders\ProcessOrderReceiptData;
use App\Http\Controllers\Controller;
use App\Models\Orders;
use App\Services\PaymentService;

class PaymentController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService,
    ) {}

    public function processPayment(ProcessOrderReceiptData $data)
    {
        $order = Orders::findOrFail($data->order_id);
        $this->paymentService->processPayment($order, $data);

        return response()->json(['message' => 'Payment processed successfully.']);
    }
}
