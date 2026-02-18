<?php

namespace App\Data\Orders;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class OrderedItemData extends Data
{
    public function __construct(
        public int $id,
        public int $selected_uom_id,
        public int $quantity,
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'id' => ['required', 'integer', 'distinct'],
            'selected_uom_id' => ['required', 'integer'],
            'quantity' => ['required', 'integer', 'min:1'],
        ];
    }
}
