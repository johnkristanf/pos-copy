<?php

namespace App\Data\Integration;

use Spatie\LaravelData\Attributes\FromRouteParameter;
use Spatie\LaravelData\Attributes\Validation\IntegerType;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Data;

class DeleteAppData extends Data
{
    public function __construct(
        #[Required, IntegerType, FromRouteParameter('apps')]
        public int $id
    ) {}
}
