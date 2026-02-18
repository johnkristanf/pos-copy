<?php

namespace App\Data\Returns;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class CreateRFCFormData extends Data
{
    public function __construct(
        public string $invoice_number,
        public string $invoice_issued_date,
        public string $reason,
        public int $customer_id,
        /** @var DataCollection<ReturnedItemData> */
        #[DataCollectionOf(ReturnedItemData::class)]
        public DataCollection $returned_items,
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'invoice_number' => ['required', 'string', 'unique:return_from_customers,invoice_number'],
            'invoice_issued_date' => ['required', 'date'],
            'reason' => ['required', 'string'],
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'returned_items' => ['required', 'array', 'min:1'],
        ];
    }
}
