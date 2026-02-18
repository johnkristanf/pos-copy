<?php

namespace App\Data\Items;

use Spatie\LaravelData\Attributes\Validation\AfterOrEqual;
use Spatie\LaravelData\Attributes\Validation\Date;
use Spatie\LaravelData\Attributes\Validation\In;
use Spatie\LaravelData\Attributes\Validation\IntegerType;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Min;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Data;

class GetManyCategoriesData extends Data
{
    public function __construct(
        #[Nullable, StringType, Max(255)]
        public ?string $search = null,

        #[Nullable, StringType, In(['name', 'code'])]
        public ?string $search_by = null,

        #[Nullable, Date]
        public ?string $date_from = null,

        #[Nullable, Date, AfterOrEqual('date_from')]
        public ?string $date_to = null,

        #[Nullable, StringType]
        public ?string $status = null,

        #[Nullable, IntegerType, Min(1), Max(100)]
        public int $per_page = 10,
    ) {}
}
