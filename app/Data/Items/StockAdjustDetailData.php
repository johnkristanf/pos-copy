<?php

namespace App\Data\Items;

use App\Models\Stock;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class StockAdjustDetailData extends Data
{
    public function __construct(
        public float $quantity,
        public string $action,
        public int $item_id,
        public int $location_id,
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'quantity' => ['required', 'numeric', 'min:1'],
            'action' => ['required', 'in:'.Stock::INCREASE.','.Stock::DEDUCT],
            'item_id' => ['required', 'numeric', 'exists:items,id'],
            'location_id' => ['required', 'numeric', 'exists:stock_locations,id'],
        ];
    }
}
