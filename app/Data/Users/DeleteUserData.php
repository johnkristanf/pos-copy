<?php

namespace App\Data\Users;

use App\Models\User;
use Spatie\LaravelData\Data;

class DeleteUserData extends Data
{
    public function __construct(
        public User $user
    ) {}
}
