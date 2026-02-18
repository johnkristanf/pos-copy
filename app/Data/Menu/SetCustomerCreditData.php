<?php

namespace App\Data\Menu;

use Spatie\LaravelData\Attributes\Validation\Exists;
use Spatie\LaravelData\Attributes\Validation\IntegerType;
use Spatie\LaravelData\Attributes\Validation\Min;
use Spatie\LaravelData\Attributes\Validation\Numeric;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Data;

class SetCustomerCreditData extends Data
{
    public function __construct(
        #[Required, IntegerType, Exists('customers', 'id')]
        public int $customer_id,

        #[Required, Numeric, Min(0)]
        public float $limit,

        #[Required, IntegerType, Min(0)]
        public int $term,
    ) {}
}
