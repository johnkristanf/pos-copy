<?php

namespace App\Data\Items;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class StorePurchasedItemData extends Data
{
    public function __construct(
        public string $purchase_order_id,
        public ?string $received_at,
        public ?string $acknowledgment_receipt,
        public ?string $remarks,
        /** @var DataCollection<StorePurchasedItemDetailData> */
        #[DataCollectionOf(StorePurchasedItemDetailData::class)]
        public DataCollection $items,
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'purchase_order_id' => ['required', 'uuid'],
            'received_at' => ['nullable', 'date'],
            'acknowledgment_receipt' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array'],
        ];
    }
}
