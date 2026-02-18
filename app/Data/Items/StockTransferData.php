<?php

namespace App\Data\Items;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class StockTransferData extends Data
{
    public function __construct(
        /** @var DataCollection<StockTransferItemData> */
        #[DataCollectionOf(StockTransferItemData::class)]
        public DataCollection $selected_items_to_transfer,
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'selected_items_to_transfer' => ['required', 'array', 'min:1'],
            'selected_items_to_transfer.*.item_id' => ['required', 'integer', 'exists:items,id'],
            'selected_items_to_transfer.*.quantity_to_transfer' => ['required', 'integer', 'min:1'],
            'selected_items_to_transfer.*.source_stock_location_id' => ['required', 'integer', 'exists:stock_locations,id'],
            'selected_items_to_transfer.*.destination_stock_location_id' => ['required', 'integer', 'exists:stock_locations,id'],
        ];
    }
}
