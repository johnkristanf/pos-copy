<?php

namespace App\Data\Orders;

use Illuminate\Validation\Rule;
use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class CreateOrderData extends Data
{
    public function __construct(
        public int $customer_id,
        public float $total_payable,
        public float $paid_amount,
        public PaymentMethodData $payment_method,
        /** @var DataCollection<OrderedItemData> */
        #[DataCollectionOf(OrderedItemData::class)]
        public DataCollection $ordered_items,
        public ?int $used_voucher = null,
        public ?float $vouchers_used = null,
        public bool $is_draft = false,
        public ?int $draft_id = null,
        public ?string $po_number = null,
        public ?string $override_email = null,
        public ?string $override_password = null,
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'ordered_items' => ['required', 'array', 'min:1'],
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'payment_method' => ['required', 'array'],
            'total_payable' => ['required', 'numeric', 'min:0'],
            'paid_amount' => ['required', 'numeric', 'min:0'],
            'used_voucher' => ['nullable', 'integer', 'exists:vouchers,id'],
            'vouchers_used' => ['nullable', 'numeric', 'min:0'],
            'is_draft' => ['sometimes', 'boolean'],
            'draft_id' => ['sometimes', 'nullable', 'integer', 'exists:orders,id'],
            'po_number' => ['sometimes', 'nullable', 'string', 'max:255', Rule::unique('orders', 'po_number')->ignore(request('draft_id'))],
            'override_email' => ['sometimes', 'nullable', 'string', 'email'],
            'override_password' => ['sometimes', 'nullable', 'string'],
        ];
    }
}
