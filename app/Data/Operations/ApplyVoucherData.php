<?php

namespace App\Data\Operations;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class ApplyVoucherData extends Data
{
    public function __construct(
        public string $code,
        public float $order_amount,
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'code' => ['required', 'string'],
            'order_amount' => ['required', 'numeric', 'min:0'],
        ];
    }
}
