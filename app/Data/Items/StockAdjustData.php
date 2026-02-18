<?php

namespace App\Data\Items;

use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class StockAdjustData extends Data
{
    public function __construct(
        /** @var DataCollection<StockAdjustDetailData> */
        #[DataCollectionOf(StockAdjustDetailData::class)]
        public DataCollection $adjust_details,
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'adjust_details' => ['required', 'array'],
        ];
    }
}
