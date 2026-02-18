<?php

namespace App\Data\Items;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class DeleteItemData extends Data
{
    public function __construct(
        public int $id
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'id' => ['required', 'integer', 'exists:items,id'],
        ];
    }
}
