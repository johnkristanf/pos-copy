<?php

namespace App\Data\Orders;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class PaymentMethodData extends Data
{
    public function __construct(
        public int $id,
        public string $tag,
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'id' => ['required', 'integer', 'exists:payment_methods,id'],
            'tag' => ['required', 'string'],
        ];
    }
}
