<?php

namespace App\Data\Notifications;

use Spatie\LaravelData\Attributes\Validation\ArrayType;
use Spatie\LaravelData\Attributes\Validation\Date;
use Spatie\LaravelData\Attributes\Validation\IntegerType;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Data;

class UpdateNotificationData extends Data
{
    public function __construct(
        #[Nullable, ArrayType]
        public ?array $actions = null,

        #[Nullable, ArrayType]
        public ?array $seen_by = null,

        #[Nullable, Date]
        public ?string $seen_at = null,

        #[Nullable, IntegerType]
        public ?int $user_id = null,
    ) {}
}
