<?php

namespace App\Data\Items;

use Spatie\LaravelData\Data;

class StorePurchasedItemObjectData extends Data
{
    public function __construct(
        public ?string $name,
        public ?string $brand,
        public ?string $color,
        public ?string $size,
        public ?StorePurchasedItemUomData $purchase_uom,
        public ?StorePurchasedItemCategoryData $category,
        public ?StorePurchasedItemSupplierData $supplier,
    ) {}
}
