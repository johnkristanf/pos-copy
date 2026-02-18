<?php

namespace App\Data\Items;

use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Attributes\Validation\Unique;
use Spatie\LaravelData\Data;

class CreateUnitOfMeasureData extends Data
{
    public function __construct(
        #[Required, StringType, Max(255), Unique('unit_of_measures', 'code')]
        public string $code,

        #[Required, StringType, Max(255)]
        public string $name,
    ) {}
}
