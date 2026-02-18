<?php

namespace Database\Seeders;

use App\Models\Features;
use App\Models\ReturnsProcessRole;
use App\Models\Roles; // Or your specific Role model
use Illuminate\Database\Seeder;

class StockAdjustmentProcessRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $featureTag = config('features.stock_adjustment.tag') ?? 'stock_adjustment';

        $feature = Features::where('tag', $featureTag)->first();

        if (! $feature) {
            $this->command->error("Feature '{$featureTag}' not found. Please seed features first.");

            return;
        }

        $checkerRoleCodes = [
            config('roles.supervisor.code') ?? 'supervisor',
        ];

        $approverRoleCodes = [
            config('roles.evp.code') ?? 'evp',
        ];

        $checkerRoles = Roles::whereIn('code', $checkerRoleCodes)->get();
        foreach ($checkerRoles as $role) {
            ReturnsProcessRole::firstOrCreate([
                'role_id' => $role->id,
                'feature_id' => $feature->id,
                'type' => ReturnsProcessRole::CHECKER,
            ]);
        }

        $approverRoles = Roles::whereIn('code', $approverRoleCodes)->get();
        foreach ($approverRoles as $role) {
            ReturnsProcessRole::firstOrCreate([
                'role_id' => $role->id,
                'feature_id' => $feature->id,
                'type' => ReturnsProcessRole::APPROVER,
            ]);
        }

        $this->command->info('Stock Adjustment process roles seeded successfully.');
    }
}
