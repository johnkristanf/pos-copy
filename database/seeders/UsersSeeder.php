<?php

namespace Database\Seeders;

use App\Models\Features;
use App\Models\Permissions;
use App\Models\Roles;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rolesConfig = config('roles');
        $roles = Roles::pluck('id', 'code')->toArray();
        $getRoleId = fn ($key) => isset($rolesConfig[$key]['code']) ? ($roles[$rolesConfig[$key]['code']] ?? null) : null;

        // ==========================================
        // DEBUG ADMIN (Super Admin - Access All)
        // ==========================================
        $debugAdmin = User::firstOrCreate(
            ['email' => 'debug@example.com'],
            [
                'first_name' => 'Debug',
                'last_name' => 'Admin',
                'password' => Hash::make('123456789'),
                'email_verified_at' => now(),
            ]
        );

        $superAdminRole = Roles::firstOrCreate(
            ['code' => 999],
            ['name' => 'Super Admin']
        );

        $debugAdmin->roles()->syncWithoutDetaching([$superAdminRole->id]);

        $allFeatures = Features::query()->pluck('id');
        $allPermissions = Permissions::query()->pluck('id');
        $superAdminPermissions = [];

        foreach ($allFeatures as $featureId) {
            foreach ($allPermissions as $permissionId) {
                $superAdminPermissions[] = [
                    'role_id' => $superAdminRole->id,
                    'feature_id' => $featureId,
                    'permission_id' => $permissionId,
                ];
            }
        }

        DB::table('role_feature_permissions')->insertOrIgnore($superAdminPermissions);

        // ==========================================
        // 2. STANDARD ADMINISTRATOR
        // ==========================================
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'first_name' => 'System',
                'last_name' => 'Administrator',
                'password' => Hash::make('123456789'),
                'email_verified_at' => now(),
            ]
        );

        if ($adminRoleId = $getRoleId('administrator')) {
            $admin->roles()->syncWithoutDetaching([$adminRoleId]);
        }

        // ==========================================
        // 3. OTHER USERS
        // ==========================================
        $usersData = [
            // Sales Officers
            [
                'email' => 'salesofficer1@example.com',
                'first_name' => 'Hazel',
                'last_name' => 'Uyanguren',
                'role' => 'sales_officer',
            ],
            [
                'email' => 'salesofficer2@example.com',
                'first_name' => 'Roby Khris Michael',
                'last_name' => 'Batiao',
                'role' => 'sales_officer',
            ],
            [
                'email' => 'salesofficer3@example.com',
                'first_name' => 'Niel Ian',
                'last_name' => 'Sawila',
                'role' => 'sales_officer',
            ],
            [
                'email' => 'salesofficer4@example.com',
                'first_name' => 'Dexter',
                'last_name' => 'Senangote',
                'role' => 'sales_officer',
            ],

            // Cashier
            [
                'email' => 'cashier1@example.com',
                'first_name' => 'Monabel',
                'last_name' => 'Taleon',
                'role' => 'cashier',
            ],

            // Inventory Managers
            [
                'email' => 'inventory_manager1@example.com',
                'first_name' => 'Giecris',
                'last_name' => 'Genterone',
                'role' => 'inventory_manager',
            ],

            // Specific Administrator User (from list)
            [
                'email' => 'administrator1@example.com',
                'first_name' => 'Rosemarie',
                'last_name' => 'Villacorta',
                'role' => 'administrator',
            ],

            // Supervisor
            [
                'email' => 'supervisor1@example.com',
                'first_name' => 'Mac Art Del Morr',
                'last_name' => 'Zembrano',
                'role' => ['supervisor', 'sales_officer'],
            ],

            // Purchasing & Sales Head
            [
                'email' => 'purchase_sales_head1@example.com',
                'first_name' => 'Laureece Mae',
                'last_name' => 'Lumaad',
                'role' => ['purchase_sales_head', 'sales_officer'],
            ],
            [
                'email' => 'purchase_sales_head2@example.com',
                'first_name' => 'Elkin',
                'last_name' => 'Lao',
                'role' => 'purchase_sales_head',
            ],

            // EVP
            [
                'email' => 'evp1@example.com',
                'first_name' => 'Cres Marie',
                'last_name' => 'Galang-Ferrer',
                'role' => 'evp',
            ],

            [
              'email' => 'evp2@example.com',
              'first_name' => 'Iñigo',
              'last_name' => 'Taojo',
              'role' => 'evp',
            ],

            // Merchandiser
            [
                'email' => 'merchandiser1@example.com',
                'first_name' => 'Tony',
                'last_name' => 'Andres',
                'role' => 'merchandiser',
            ],

            // Inventory Officers
            [
                'email' => 'inventoryofficer1@example.com',
                'first_name' => 'Bryan',
                'last_name' => 'Gegremosa',
                'role' => 'inventory_officer',
            ],
            [
                'email' => 'inventoryofficer2@example.com',
                'first_name' => 'Melvin',
                'last_name' => 'Garcia',
                'role' => 'inventory_officer',
            ],
        ];

        foreach ($usersData as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name'],
                    'password' => Hash::make('123456789'),
                    'email_verified_at' => now(),
                ]
            );

            $rolesList = is_array($data['role']) ? $data['role'] : [$data['role']];

            $roleIdsToSync = [];

            foreach ($rolesList as $roleKey) {
                $roleId = $getRoleId($roleKey);

                if ($roleId) {
                    $roleIdsToSync[] = $roleId;
                }
            }

            // Sync all collected role IDs
            if (! empty($roleIdsToSync)) {
                $user->roles()->syncWithoutDetaching($roleIdsToSync);
            }
        }
    }
}
