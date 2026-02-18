<?php

namespace Database\Seeders;

use App\Models\Features;
use App\Models\ReturnsProcessRole;
use App\Models\Roles;
use Illuminate\Database\Seeder;

class ReturnsProcessRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $checkerRoleCodes = [
            config('roles.supervisor.code'),
            // can add another role, depending on the business process
        ];

        $approverRoleCodes = [
            config('roles.merchandiser.code'),
            config('roles.purchase_sales_head.code'),
            // can add another role, depending on the business process
        ];

        $featureTags = [
            config('features.return_from_customer.tag'),
            config('features.return_to_supplier.tag'),
        ];

        $features = Features::query()->whereIn('tag', $featureTags)->get();

        foreach ($features as $feature) {
            $checkerRoles = Roles::query()->whereIn('code', $checkerRoleCodes)->get();
            foreach ($checkerRoles as $checkerRole) {
                ReturnsProcessRole::create([
                    'role_id' => $checkerRole->id,
                    'feature_id' => $feature->id,
                    'type' => ReturnsProcessRole::CHECKER,
                ]);
            }

            $approverRoles = Roles::whereIn('code', $approverRoleCodes)->get();
            foreach ($approverRoles as $approverRole) {
                ReturnsProcessRole::create([
                    'role_id' => $approverRole->id,
                    'feature_id' => $feature->id,
                    'type' => ReturnsProcessRole::APPROVER,
                ]);
            }
        }
    }
}
