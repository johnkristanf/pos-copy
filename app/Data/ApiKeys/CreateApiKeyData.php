<?php

namespace App\Data\ApiKeys;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class CreateApiKeyData extends Data
{
    public function __construct(
        public string $label,
        public int $key_expiration_id,

        /** @var array<int, ApiKeyFeatureData> */
        #[DataCollectionOf(ApiKeyFeatureData::class)]
        public ?array $features = [],

        public string $type = 'inbound',
        public ?string $key = null,
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'type' => ['nullable', 'string', 'in:inbound,outbound'],
            'label' => ['required', 'string', 'max:255'],
            'key' => ['nullable', 'string', 'max:255'],
            'key_expiration_id' => ['required', 'exists:key_expiration_options,id'],
            'features' => ['nullable', 'array'],
        ];
    }

    public static function messages(...$args): array
    {
        return [
            'label.required' => 'API key label is required',
            'key_expiration_id.required' => 'Expiration period is required',
        ];
    }
}
