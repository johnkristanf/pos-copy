<?php

namespace App\Data\Items;

use Spatie\LaravelData\Attributes\FromRouteParameter;
use Spatie\LaravelData\Attributes\Validation\IntegerType;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Data;

class DeleteCategoryData extends Data
{
    public function __construct(
        #[Required, IntegerType, FromRouteParameter('category')]
        public int $id
    ) {}
}
