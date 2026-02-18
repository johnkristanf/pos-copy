<?php

namespace App\Data\Menu;

use Illuminate\Http\UploadedFile;
use Illuminate\Validation\Rule;
use Spatie\LaravelData\Attributes\Validation\ArrayType;
use Spatie\LaravelData\Attributes\Validation\Decimal;
use Spatie\LaravelData\Attributes\Validation\Email;
use Spatie\LaravelData\Attributes\Validation\Exists;
use Spatie\LaravelData\Attributes\Validation\IntegerType;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Min;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Attributes\Validation\Numeric;
use Spatie\LaravelData\Attributes\Validation\Sometimes;
use Spatie\LaravelData\Attributes\Validation\StringType;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class UpdateCustomerData extends Data
{
    public function __construct(
        #[Sometimes, StringType, Max(255)]
        public ?string $name = null,

        #[Sometimes, StringType, Email, Max(255)]
        public ?string $email = null,

        #[Nullable, Numeric, Min(0), Decimal(0, 2)]
        public ?float $credit_limit = null,

        #[Nullable, IntegerType, Min(0)]
        public ?int $credit_term = null,

        #[Nullable, ArrayType]
        public ?array $location = null,

        #[Nullable, IntegerType, Exists('locations', 'id')]
        public ?int $location_id = null,

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
        $customer = request()->route('customers');
        $customerId = \is_object($customer) ? $customer->id : $customer;

        return [
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('customers', 'email')->ignore($customerId),
            ],
            'location.country' => ['sometimes', 'required_with:location', 'string'],
            'location.region' => ['nullable', 'string'],
            'location.province' => ['nullable', 'string'],
            'location.municipality' => ['nullable', 'string'],
            'location.barangay' => ['nullable', 'string'],
        ];
    }
}
