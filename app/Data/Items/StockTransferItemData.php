<?php

namespace App\Data\Items;

use Spatie\LaravelData\Data;

class StockTransferItemData extends Data
{
    public function __construct(
        public int $item_id,
        public int $quantity_to_transfer,
        public int $source_stock_location_id,
        public int $destination_stock_location_id,
    ) {}
}
