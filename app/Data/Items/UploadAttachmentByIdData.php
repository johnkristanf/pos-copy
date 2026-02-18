<?php

namespace App\Data\Items;

use Illuminate\Http\UploadedFile;
use Spatie\LaravelData\Attributes\Validation\Exists;
use Spatie\LaravelData\Attributes\Validation\IntegerType;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Data;

class UploadAttachmentByIdData extends Data
{
    public function __construct(
        #[Required, Max(20480)]
        public UploadedFile $file,

        #[Nullable, IntegerType, Exists('items', 'id')]
        public ?int $item_id = null,

        #[Nullable, IntegerType, Exists('customers', 'id')]
        public ?int $customer_id = null,
    ) {}
}
