<?php

namespace App\Data\Items;

use Spatie\LaravelData\Attributes\FromRouteParameter;
use Spatie\LaravelData\Attributes\Validation\IntegerType;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Data;

class DeleteUnitOfMeasureData extends Data
{
    public function __construct(
        #[Required, IntegerType, FromRouteParameter('unit')]
        public int $id
    ) {}
}
