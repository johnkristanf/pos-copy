<?php

namespace App\Data\Menu;

use Illuminate\Http\UploadedFile;
use Spatie\LaravelData\Attributes\Validation\ArrayType;
use Spatie\LaravelData\Attributes\Validation\Decimal;
use Spatie\LaravelData\Attributes\Validation\IntegerType;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Min;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Attributes\Validation\Numeric;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class CreateCustomerData extends Data
{
    public function __construct(
        #[Required, StringType, Max(255)]
        public string $name,

        #[Nullable, StringType, Max(255)]
        public ?string $email,

        #[Required, Numeric, Min(0), Decimal(0, 2)]
        public float $credit_limit,

        #[Required, IntegerType, Min(0)]
        public int $credit_term,

        #[Nullable, ArrayType]
        public ?array $location = null,

        #[Nullable]
        public string|UploadedFile|null $customer_img = null,

        #[Nullable, StringType, Max(20)]
        public ?string $contact_no = null,

        #[Nullable, IntegerType]
        public ?int $blob_attachment_id = null,

        #[Nullable, IntegerType]
        public ?int $credit_rating = null,
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'email' => ['nullable', 'email', 'max:255', 'unique:customers,email'],
            'location.country' => ['required_with:location', 'string', 'max:255'],
            'location.region' => ['nullable', 'string', 'max:255'],
            'location.province' => ['nullable', 'string', 'max:255'],
            'location.municipality' => ['nullable', 'string', 'max:255'],
            'location.barangay' => ['nullable', 'string', 'max:255'],
        ];
    }
}
