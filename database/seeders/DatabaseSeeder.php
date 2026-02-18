<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        config(['broadcasting.default' => 'null']);

        $this->call([
            // 1. Base Organization & Location Data
            CompanySeeder::class,
            BranchSeeder::class,
            LocationSeeder::class, // Geographic locations (Regions, Provinces, etc.)
            StockLocationSeeder::class, // Physical Stores/Warehouses

            // 2. RBAC Structure (Roles, Features, Permissions)
            RolesSeeder::class,
            FeaturesSeeder::class,
            PermissionsSeeder::class,
            FeaturePermissionsSeeder::class, // Maps Features <-> Permissions
            RoleFeaturePermissionsSeeder::class, // Maps Roles <-> FeaturePermissions (The Access Matrix)

            // 3. Users & Authentication
            UsersSeeder::class, // Creates Users and assigns Roles
            UserLocationSeeder::class, // Assigns Users to Stock Locations
            AppsSeeder::class,
            KeyExpirationOptionSeeder::class,
            ApiKeySeeder::class,

            // 4. Inventory & Operations Master Data
            ItemCategorySeeder::class,
            UnitOfMeasureSeeder::class,
            SupplierSeeder::class,
            PaymentMethodsSeeder::class,
            // VoidReasonSeeder::class,

            // 5. Operational Data (Customers, Items, Orders)
            CustomerSeeder::class,

            ItemSeeder::class,
            // OrdersSeeder::class,
            ReturnsProcessRoleSeeder::class,
            // 6. Stock Adjustment Process Roles
            StockAdjustmentProcessRoleSeeder::class,
        ]);
    }
}
