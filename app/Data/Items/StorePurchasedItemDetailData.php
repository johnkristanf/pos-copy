<?php

namespace App\Data\Items;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class StorePurchasedItemDetailData extends Data
{
    public function __construct(
        public string $purchase_order_item_id,
        public int $quantity,
        public ?float $discount,
        public ?float $unit_price,
        public ?StorePurchasedItemObjectData $item,
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'purchase_order_item_id' => ['required', 'uuid'],
            'quantity' => ['required', 'integer', 'min:1'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'unit_price' => ['nullable', 'numeric', 'min:0'],
            'item' => ['nullable', 'array'],
        ];
    }
}
