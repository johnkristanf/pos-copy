<?php

namespace App\Data\Operations;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class DeleteDiscountData extends Data
{
    public function __construct(
        public int $id
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'id' => ['required', 'integer', 'exists:discounts,id'],
        ];
    }
}
