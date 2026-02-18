<?php

namespace App\Services;

use App\Models\Permissions;
use Illuminate\Support\Collection;

class PermissionsService
{
    public function getPermissionsKeyedByName(): Collection
    {
        return Permissions::all()->keyBy('name');
    }
}
