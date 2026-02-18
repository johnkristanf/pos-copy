<?php

namespace App\Data\Items;

use Spatie\LaravelData\Data;

class StorePurchasedItemSupplierLocationData extends Data
{
    public function __construct(
        public ?string $country,
        public ?string $region,
        public ?string $province,
        public ?string $municipality,
        public ?string $barangay,
    ) {}
}
