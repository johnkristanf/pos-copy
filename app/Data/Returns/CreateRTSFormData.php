<?php

namespace App\Data\Returns;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class CreateRTSFormData extends Data
{
    public function __construct(
        public int $supplier_id,
        public string $type,
        /** @var DataCollection<ItemToReturnData> */
        #[DataCollectionOf(ItemToReturnData::class)]
        public DataCollection $items_to_return,
        public ?string $remarks = null,
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'supplier_id' => ['required', 'integer', 'exists:suppliers,id'],
            'type' => [
                'required',
                'string',
                'in:'.implode(',', [
                    config('types.returns_to_supplier.offset'),
                    config('types.returns_to_supplier.replacement'),
                ]),
            ],
            'remarks' => ['nullable', 'string'],
            'items_to_return' => ['required', 'array', 'min:1'],
        ];
    }
}
