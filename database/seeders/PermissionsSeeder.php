<?php

namespace Database\Seeders;

use App\Models\Permissions;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            config('permissions.read'),
            config('permissions.view'),
            config('permissions.create'),
            config('permissions.update'),
            config('permissions.delete'),
            config('permissions.approve'),
            config('permissions.print'),
        ];

        foreach ($permissions as $permission) {
            Permissions::updateOrCreate(
                ['slug' => Str::slug($permission)],
                [
                    'name' => $permission,
                    'slug' => Str::slug($permission),
                ]
            );
        }
    }
}
