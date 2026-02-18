<?php

namespace App\Data\Operations;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class CreateVoidReasonData extends Data
{
    public function __construct(
        public string $void_reason,
        public bool $require_password,
        public array $roles_require_credentials = [],
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'void_reason' => ['required', 'string', 'max:255'],
            'require_password' => ['required', 'boolean'],
            'roles_require_credentials' => ['required_if:require_password,true', 'array'],
            'roles_require_credentials.*' => ['integer', 'exists:roles,id'],
        ];
    }
}
