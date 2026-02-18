<?php

namespace App\Data\Orders;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class ProcessOrderReceiptData extends Data
{
    public function __construct(
        public int $order_id,
        public float $total_payable,
        public ?float $paid_amount = null,
        public ?int $used_voucher = null,
        public ?float $vouchers_used = null,
        public ?bool $with_tax = null,
        public ?string $override_email = null,
        public ?string $override_password = null,
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'order_id' => ['required', 'integer', 'exists:orders,id'],
            'total_payable' => ['required', 'numeric', 'min:0'],
            'paid_amount' => ['nullable', 'numeric', 'min:0'],
            'used_voucher' => ['nullable', 'integer', 'exists:vouchers,id'],
            'vouchers_used' => ['nullable', 'numeric', 'min:0'],
            'with_tax' => ['nullable', 'boolean'],
            'override_email' => ['nullable', 'string', 'email'],
            'override_password' => ['nullable', 'string'],
        ];
    }
}
