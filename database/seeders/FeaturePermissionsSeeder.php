<?php

namespace Database\Seeders;

use App\Models\Features;
use App\Models\Permissions;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FeaturePermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $features = Features::all();
        $permissions = Permissions::all();

        // Map defining all POSSIBLE permissions for a feature across all roles
        $featurePermissionMap = [
            config('features.all_orders.name') => ['read', 'print'],
            config('features.create_order.name') => ['create', 'read', 'update', 'delete', 'print'],
            config('features.convert_item.name') => ['create', 'read', 'update'],
            config('features.quotation.name') => ['read', 'update', 'print'],
            config('features.customer_profile.name') => ['create', 'read', 'update'],
            config('features.return_from_customer.name') => ['create', 'read', 'update', 'delete', 'approve', 'print'],

            config('features.receive_payment.name') => ['create', 'read', 'update', 'print'],
            config('features.order_receipt.name') => ['read', 'print'],
            config('features.credit_rating.name') => ['create', 'read', 'update', 'approve'],
            config('features.price_analysis_report.name') => ['read', 'print'],
            config('features.price_and_discount.name') => ['create', 'read', 'update'],
            config('features.item_wholesale_discount.name') => ['create', 'read', 'update'],
            config('features.override_order_wholesale_discount.name') => ['read', 'update'],

            config('features.customer_orders_pickup.name') => ['read'],
            config('features.return_to_supplier.name') => ['create', 'read', 'update', 'approve', 'print'],
            config('features.inventory.name') => ['create', 'read', 'print'],
            config('features.stock_in.name') => ['create', 'read', 'update', 'print'],
            config('features.stock_transfer.name') => ['create', 'read', 'delete'],
            config('features.stock_alert.name') => ['read'],
            config('features.inventory_reports.name') => ['read', 'approve', 'print'],
            config('features.customer_order_withdrawal.name') => ['read'],
            config('features.item_management.name') => ['create', 'read', 'update', 'delete'],
            config('features.reports_and_analytics.name') => ['read', 'print'],

            config('features.user_management.name') => ['create', 'read', 'update', 'delete'],
            config('features.user_access_management.name') => ['read'],
            config('features.project_management.name') => ['create', 'read', 'update', 'delete'],
            config('features.tenant_management.name') => ['read', 'update', 'delete'],
            config('features.api_key_management.name') => ['create', 'read', 'update', 'delete'],
        ];

        foreach ($features as $feature) {
            $featureName = $feature->getAttribute('name');

            if (isset($featurePermissionMap[$featureName])) {
                $permissionSlugs = $featurePermissionMap[$featureName];

                $featurePermissions = $permissions->whereIn('slug', $permissionSlugs);

                foreach ($featurePermissions as $permission) {
                    DB::table('feature_permissions')->insertOrIgnore([
                        'feature_id' => $feature->getAttribute('id'),
                        'permission_id' => $permission->getAttribute('id'),
                    ]);
                }
            }
        }
    }
}
