<?php

namespace App\Data\Items;

use Spatie\LaravelData\Attributes\Validation\Min;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Attributes\Validation\Numeric;
use Spatie\LaravelData\Data;

class UpdateSellingPriceData extends Data
{
    public function __construct(
        #[Nullable, Numeric, Min(0)]
        public ?float $unit_price = null,

        #[Nullable, Numeric, Min(0)]
        public ?float $wholesale_price = null,

        #[Nullable, Numeric, Min(0)]
        public ?float $credit_price = null,
    ) {}
}
