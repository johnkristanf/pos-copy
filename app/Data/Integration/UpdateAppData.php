<?php

namespace App\Data\Integration;

use Spatie\LaravelData\Attributes\Validation\BooleanType;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;

class UpdateAppData extends Data
{
    public function __construct(
        #[StringType, Max(255)]
        public string|Optional $name,

        #[StringType, Max(255)]
        public string|Optional $slug,

        #[BooleanType]
        public bool|Optional $isactive,
    ) {}
}
