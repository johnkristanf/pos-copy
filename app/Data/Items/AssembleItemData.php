<?php

namespace App\Data\Items;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class AssembleItemData extends Data
{
    public function __construct(
        public int $reference_item_id,
        public int $desired_quantity,
        public int $stock_location_id,
        /** @var array<int> */
        public array $selected_stock_ids,
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'reference_item_id' => ['required', 'integer', 'exists:items,id'],
            'desired_quantity' => ['required', 'integer'],
            'stock_location_id' => ['required', 'integer', 'exists:stock_locations,id'],
            'selected_stock_ids' => ['required', 'array', 'min:1'],
            'selected_stock_ids.*' => ['required', 'integer', 'exists:stocks,id'],
        ];
    }
}
