<?php

namespace App\Data\ApiKeys;

use App\Models\ApiKeys;
use Spatie\LaravelData\Data;

class DeleteApiKeyData extends Data
{
    public function __construct(
        public ApiKeys $apiKey
    ) {}
}
