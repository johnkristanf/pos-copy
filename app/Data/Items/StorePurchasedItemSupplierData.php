<?php

namespace App\Data\Items;

use Spatie\LaravelData\Data;

class StorePurchasedItemSupplierData extends Data
{
    public function __construct(
        public ?string $name,
        public ?string $email,
        public ?string $contact_person,
        public ?string $contact_no,
        public ?string $telefax,
        public ?string $address,
        public ?string $shipping,
        public ?string $terms,
        public ?StorePurchasedItemSupplierLocationData $location,
    ) {}
}
