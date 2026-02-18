<?php

namespace App\Data\Returns;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class ItemToReturnData extends Data
{
    public function __construct(
        public int $item_id,
        public int $quantity,
        public string $deduction_source_type,
        public int $deduction_source_id,
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'item_id' => ['required', 'integer', 'exists:items,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'deduction_source_type' => [
                'required',
                'string',
                'in:'.implode(',', [
                    config('types.returns_to_supplier.stock'),
                    config('types.returns_to_supplier.purchase'),
                ]),
            ],
            'deduction_source_id' => ['required', 'integer'],
        ];
    }
}
