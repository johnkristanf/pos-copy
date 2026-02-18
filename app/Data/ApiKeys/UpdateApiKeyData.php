<?php

namespace App\Data\ApiKeys;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class UpdateApiKeyData extends Data
{
    public function __construct(
        public string $label,
        public int $key_expiration_id,

        /** @var array<int, ApiKeyFeatureData> */
        #[DataCollectionOf(ApiKeyFeatureData::class)]
        public ?array $features = [],
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'label' => ['required', 'string', 'max:1000'],
            'key_expiration_id' => ['required', 'integer'],
            'features' => ['nullable', 'array'],
            'features.*.id' => ['required', 'integer', 'exists:features,id'],
            'features.*.permissions' => ['required', 'array'],
            'features.*.permissions.*' => ['string', 'exists:permissions,name'],
        ];
    }
}
