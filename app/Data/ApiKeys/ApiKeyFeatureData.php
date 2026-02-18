<?php

namespace App\Data\ApiKeys;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class ApiKeyFeatureData extends Data
{
    public function __construct(
        public int $id,
        public array $permissions
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'id' => ['required', 'integer', 'exists:features,id'],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['required', 'string', 'exists:permissions,name'],
        ];
    }
}
