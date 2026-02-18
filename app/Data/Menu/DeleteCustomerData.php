<?php

namespace App\Data\Menu;

use Spatie\LaravelData\Attributes\FromRouteParameter;
use Spatie\LaravelData\Attributes\Validation\IntegerType;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Data;

class DeleteCustomerData extends Data
{
    public function __construct(
        #[Required, IntegerType, FromRouteParameter('customers')]
        public int $id
    ) {}
}
