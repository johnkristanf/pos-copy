<?php

namespace App\Services;

use App\Data\Orders\ProcessOrderReceiptData;
use App\Models\Orders;
use App\Models\Payments;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    public function processPayment(Orders $orders, ProcessOrderReceiptData $data): void
    {
        DB::transaction(function () use ($orders, $data) {
            $orders->payments()->create([
                'paid_amount' => $data->paid_amount,
            ]);

            $totalPaid = $orders->payments()->sum('paid_amount');

            $orders->payment_status = ($totalPaid >= $data->total_payable)
            ? Payments::FULLY_PAID
            : Payments::PARTIALLY_PAID;
            $orders->save();

            $statusLabel = $orders->payment_status === Payments::FULLY_PAID ? 'fully paid' : 'partially paid';
            $this->notificationService->notify("processed payment ({$statusLabel}) for", ['price_analysis_report:read'], 'order', "#{$orders->id}");
        });
    }

    public function recordOrderCreditsPayment($orderId, $amount)
    {
        $order = Orders::with(['credits.order_credit_payments'])->findOrFail($orderId);
        $orderCredits = $order->credits;

        if (! $orderCredits) {
            throw new \Exception('Order credits not found for this order.');
        }

        $orderCreditPayment = $orderCredits->order_credit_payments()->create([
            'amount' => $amount,
        ]);

        $orderCreditsPaymentsSum = $order->credits ? $order->credits->order_credit_payments()->sum('amount') : 0;

        if ($orderCreditsPaymentsSum >= $order->total_payable) {
            $order->payment_status = Payments::FULLY_PAID;
            $order->save();
        } else {
            $order->payment_status = Payments::PARTIALLY_PAID;
            $order->save();
        }

        $statusLabel = $order->payment_status === Payments::FULLY_PAID ? 'fully paid' : 'partially paid';
        $this->notificationService->notify("recorded credit payment ({$statusLabel}) for", ['price_analysis_report:read'], 'order', "#{$order->id}");

        return $orderCreditPayment;
    }

    public function recordOrderCredits($amount, Orders $order)
    {
        $order->credits()->create([
            'amount' => $amount,
        ]);

        $this->notificationService->notify('recorded credits for', ['price_analysis_report:read'], 'order', "#{$order->id}");
    }
}
