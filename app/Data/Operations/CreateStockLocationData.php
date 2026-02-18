<?php

namespace App\Data\Operations;

use Illuminate\Validation\Rule;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class CreateStockLocationData extends Data
{
    public function __construct(
        public string $name,
        public ?string $tag = null,
        public ?int $branch_id = null,
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'tag' => ['nullable', 'string', 'max:255', Rule::unique('stock_locations', 'tag')],
            'branch_id' => ['nullable', 'exists:branches,id'],
        ];
    }
}
