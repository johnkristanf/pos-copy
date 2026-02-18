<?php

namespace App\Data\Items;

use Spatie\LaravelData\Attributes\Validation\Exists;
use Spatie\LaravelData\Attributes\Validation\GreaterThan;
use Spatie\LaravelData\Attributes\Validation\IntegerType;
use Spatie\LaravelData\Attributes\Validation\Min;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Attributes\Validation\Numeric;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Data;

class CreateSellingPriceData extends Data
{
    public function __construct(
        #[Required, IntegerType, Exists('items', 'id')]
        public int $item_id,

        #[Nullable, Numeric, Min(0), GreaterThan('wholesale_price')]
        public ?float $unit_price = null,

        #[Nullable, Numeric, Min(0)]
        public ?float $wholesale_price = null,

        #[Nullable, Numeric, Min(0), GreaterThan('unit_price')]
        public ?float $credit_price = null,
    ) {}
}
