<?php

namespace App\Data\Orders;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class ServeOrderData extends Data
{
    public function __construct(
        public int $order_item_id,
        public float $quantity_to_serve,
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'order_item_id' => ['required', 'integer', 'exists:order_items,id'],
            'quantity_to_serve' => ['required', 'numeric', 'min:0'],
        ];
    }
}
