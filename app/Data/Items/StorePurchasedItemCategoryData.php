<?php

namespace App\Data\Items;

use Spatie\LaravelData\Data;

class StorePurchasedItemCategoryData extends Data
{
    public function __construct(
        public ?string $code,
        public ?string $name,
    ) {}
}
