<?php

namespace App\Data\Suppliers;

use Spatie\LaravelData\Attributes\Validation\IntegerType;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Data;

class DeleteSupplierData extends Data
{
    public function __construct(
        #[Required, IntegerType]
        public int $id
    ) {}
}
