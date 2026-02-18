<?php

namespace App\Data\Items;

use Illuminate\Http\UploadedFile;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Data;

class UpdateBlobAttachmentByIdData extends Data
{
    public function __construct(
        #[Required, Max(20480)]
        public UploadedFile $file
    ) {}
}
