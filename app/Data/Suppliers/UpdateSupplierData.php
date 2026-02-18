<?php

namespace App\Data\Suppliers;

use Spatie\LaravelData\Attributes\Validation\ArrayType;
use Spatie\LaravelData\Attributes\Validation\Email;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class UpdateSupplierData extends Data
{
    public function __construct(
        #[Required, StringType, Max(255)]
        public string $name,

        #[Required, ArrayType]
        public array $location,

        #[Nullable, StringType, Email, Max(255)]
        public ?string $email = null,

        #[Nullable, StringType, Max(255)]
        public ?string $contact_person = null,

        #[Nullable, StringType, Max(255)]
        public ?string $contact_no = null,

        #[Nullable, StringType, Max(255)]
        public ?string $telefax = null,

        #[Nullable, StringType]
        public ?string $address = null,

        #[Nullable, StringType]
        public ?string $shipping = null,

        #[Nullable, StringType, Max(255)]
        public ?string $terms = null,
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'location.country' => ['required', 'string'],
            'location.region' => ['nullable', 'string'],
            'location.province' => ['nullable', 'string'],
            'location.municipality' => ['nullable', 'string'],
            'location.barangay' => ['nullable', 'string'],
        ];
    }
}
