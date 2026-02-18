<?php

namespace App\Data\Users;

use App\Models\User;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\Optional;
use Spatie\LaravelData\Support\Validation\ValidationContext;

class UpdateUserData extends Data
{
    public function __construct(
        public string $first_name,
        public string $last_name,
        public string $email,

        #[MapInputName('stock_location_ids')]
        public array $stock_location_ids,

        public array $roles,

        public string|Optional|null $password,

        public ?string $middle_name = null,
        public ?string $user_signature = null,
        public ?string $user_image = null,
    ) {}

    public static function rules(?ValidationContext $context = null): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => [
                'required', 'string', 'lowercase', 'email', 'max:255',
                Rule::unique(User::class)->ignore(request()->route('user')?->id),
            ],
            'stock_location_ids' => ['required', 'array', 'min:1'],
            'stock_location_ids.*' => ['required', 'exists:stock_locations,id'],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['required', 'integer', 'exists:roles,id'],
            'password' => ['nullable', 'sometimes', 'max:255', Password::defaults()],
            'user_signature' => ['nullable', 'string', 'max:255'],
            'user_image' => ['nullable', 'string', 'max:255'],
        ];
    }
}
