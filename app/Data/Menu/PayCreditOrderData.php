<?php

namespace App\Data\Menu;

use Spatie\LaravelData\Attributes\Validation\Exists;
use Spatie\LaravelData\Attributes\Validation\IntegerType;
use Spatie\LaravelData\Attributes\Validation\Numeric;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Data;

class PayCreditOrderData extends Data
{
    public function __construct(
        #[Required, IntegerType, Exists('orders', 'id')]
        public int $order_id,

        #[Required, Numeric]
        public float $amount,
    ) {}
}
