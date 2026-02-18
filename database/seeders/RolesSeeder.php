<?php

namespace Database\Seeders;

use App\Models\Roles;
use Illuminate\Database\Seeder;

class RolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'code' => config('roles.sales_officer.code'),
                'name' => config('roles.sales_officer.name'),
            ],

            [
                'code' => config('roles.sales_officer.code'),
                'name' => config('roles.sales_officer.name'),
            ],

            [
                'code' => config('roles.cashier.code'),
                'name' => config('roles.cashier.name'),
            ],

            [
                'code' => config('roles.inventory_officer.code'),
                'name' => config('roles.inventory_officer.name'),
            ],

            [
                'code' => config('roles.inventory_manager.code'),
                'name' => config('roles.inventory_manager.name'),
            ],

            [
                'code' => config('roles.supervisor.code'),
                'name' => config('roles.supervisor.name'),
            ],

            [
                'code' => config('roles.administrator.code'),
                'name' => config('roles.administrator.name'),
            ],

            [
                'code' => config('roles.purchase_sales_head.code'),
                'name' => config('roles.purchase_sales_head.name'),
            ],

            [
                'code' => config('roles.merchandiser.code'),
                'name' => config('roles.merchandiser.name'),
            ],

            [
                'code' => config('roles.evp.code'),
                'name' => config('roles.evp.name'),
            ],
        ];

        foreach ($roles as $role) {
            Roles::firstOrCreate($role, $role);
        }
    }
}
