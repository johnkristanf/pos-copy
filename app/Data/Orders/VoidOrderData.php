<?php

namespace App\Data\Orders;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class VoidOrderData extends Data
{
    public function __construct(
        public int $order_id,
        public int $void_id,
        public ?string $email = null,
        public ?string $password = null,
        public ?string $override_email = null,
        public ?string $override_password = null,
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'order_id' => ['required', 'exists:orders,id'],
            'void_id' => ['required', 'exists:void_reasons,id'],
            'email' => ['nullable', 'exists:users,email'],
            'password' => ['nullable', 'string'],
            'override_email' => ['nullable', 'exists:users,email'],
            'override_password' => ['nullable', 'string'],
        ];
    }
}
