<?php

namespace App\Data\Returns;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class ReturnedItemData extends Data
{
    public function __construct(
        public int $item_id,
        public int $quantity,
        public int $stock_location_id,
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'item_id' => ['required', 'integer', 'exists:items,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'stock_location_id' => ['required', 'integer', 'exists:stock_locations,id'],
        ];
    }
}
