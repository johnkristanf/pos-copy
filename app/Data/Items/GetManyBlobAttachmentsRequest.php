<?php

namespace App\Data\Items;

use Spatie\LaravelData\Attributes\Validation\AfterOrEqual;
use Spatie\LaravelData\Attributes\Validation\Date;
use Spatie\LaravelData\Attributes\Validation\Exists;
use Spatie\LaravelData\Attributes\Validation\IntegerType;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Min;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Data;

class GetManyBlobAttachmentsData extends Data
{
    public function __construct(
        #[Nullable, StringType, Max(255)]
        public ?string $search = null,

        #[Nullable, IntegerType, Exists('items', 'id')]
        public ?int $item_id = null,

        #[Nullable, IntegerType, Exists('customers', 'id')]
        public ?int $customer_id = null,

        #[Nullable, IntegerType]
        public ?int $user_id = null,

        #[Nullable, Date]
        public ?string $date_from = null,

        #[Nullable, Date, AfterOrEqual('date_from')]
        public ?string $date_to = null,

        #[Nullable, StringType, Max(255)]
        public ?string $mime_type = null,

        #[Nullable, IntegerType, Min(1), Max(100)]
        public int $per_page = 10,
    ) {}
}
