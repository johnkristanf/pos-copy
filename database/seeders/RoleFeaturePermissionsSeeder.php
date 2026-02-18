<?php

namespace Database\Seeders;

use App\Models\Features;
use App\Models\Permissions;
use App\Models\Roles;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleFeaturePermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $rolesConfig = config('roles');
        $featuresConfig = config('features');

        $getRole = fn ($key) => isset($rolesConfig[$key]['code'])
        ? Roles::query()->where('code', $rolesConfig[$key]['code'])->first()
        : null;

        $getFeat = fn ($key) => isset($featuresConfig[$key]['tag'])
        ? Features::query()->where('tag', $featuresConfig[$key]['tag'])->first()
        : null;

        $perms = Permissions::all()->pluck('id', 'slug');
        $matrix = [
            'sales_officer' => [
                'all_orders' => ['read', 'update'],
                'create_order' => ['create', 'read', 'update', 'delete', 'print'],
                'convert_item' => ['read'],
                'quotation' => ['read', 'update', 'print'],
                'customer_profile' => ['create', 'read', 'update'],
                'return_from_customer' => ['read', 'create'],
                'reports_and_analytics' => ['read', 'print'],
                'price_and_discount' => ['read'],
            ],
            'cashier' => [
                'all_orders' => ['read', 'update'],
                'receive_payment' => ['create', 'read', 'update', 'print'],
                'create_order' => ['delete'],
                'order_receipt' => ['read'],
                'customer_profile' => ['read'],
                'credit_rating' => ['read'],
                'price_analysis_report' => ['read', 'print'],
                'price_and_discount' => ['read'],
                'item_wholesale_discount' => ['read'],
                'reports_and_analytics' => ['read', 'print'],
            ],
            'inventory_manager' => [
                'all_orders' => ['read', 'print'],
                'customer_orders_pickup' => ['read'],
                'return_from_customer' => ['create', 'read', 'update', 'print'],
                'return_to_supplier' => ['create', 'read', 'update', 'print'],
                'customer_profile' => ['create', 'read', 'update'],
                'credit_rating' => ['create', 'read', 'update'],
                'inventory' => ['create', 'read', 'print'],
                'stock_in' => ['create', 'read', 'update', 'print'],
                'stock_transfer' => ['create', 'read', 'delete'],
                'stock_alert' => ['read'],
                'inventory_reports' => ['read', 'approve', 'print'],
                'customer_order_withdrawal' => ['read'],
                'item_management' => ['create', 'read', 'update'],
                'convert_item' => ['create', 'read', 'update'],
                'price_and_discount' => ['read'],
                'price_analysis_report' => ['read', 'print'],
                'reports_and_analytics' => ['read', 'print'],
            ],
            'merchandiser' => [
                'customer_profile' => ['create', 'read', 'update'],
                'return_from_customer' => ['read', 'approve', 'print'],
                'return_to_supplier' => ['read', 'update', 'approve', 'print'],
                'inventory' => ['read'],
                'price_and_discount' => ['create', 'read', 'update', 'delete'],
                'price_analysis_report' => ['read', 'print'],
                'credit_rating' => ['read'],
                'item_wholesale_discount' => ['create', 'read', 'update', 'delete'],
                'override_order_wholesale_discount' => ['read', 'update', 'delete'],
                'reports_and_analytics' => ['read', 'print'],
                'inventory_reports' => ['read', 'approve', 'print'],
                'item_management' => ['read'],
                'tenant_management' => ['read'],
            ],
            'supervisor' => [
                'reports_and_analytics' => ['read', 'print'],
                'return_from_customer' => ['read', 'approve', 'print'],
                'return_to_supplier' => ['read', 'approve', 'print'],
                'item_management' => ['read', 'approve'],
                'inventory' => ['read', 'print'],
                'price_and_discount' => ['read'],
            ],
            'evp' => [
                'all_orders' => ['read', 'print'],
                'receive_payment' => ['read', 'print'],
                'order_receipt' => ['read', 'print'],
                'return_from_customer' => ['read', 'print'],
                'return_to_supplier' => ['read', 'print'],
                'customer_profile' => ['read'],
                'inventory' => ['read', 'print'],
                'stock_in' => ['read', 'print'],
                'inventory_reports' => ['read', 'print'],
                'credit_rating' => ['read', 'approve'],
                'price_and_discount' => ['read'],
                'price_analysis_report' => ['read', 'print'],
                'item_wholesale_discount' => ['read'],
                'override_order_wholesale_discount' => ['read'],
                'reports_and_analytics' => ['read', 'print'],
                'customer_orders_pickup' => ['read'],
                'customer_order_withdrawal' => ['read'],
                'item_management' => ['read', 'approve'],
                'user_access_management' => ['read'],
                'project_management' => ['read'],
                'tenant_management' => ['create', 'read', 'update'],
            ],
            'purchase_sales_head' => [
                'all_orders' => ['read', 'print'],
                'receive_payment' => ['read', 'print'],
                'order_receipt' => ['read', 'print'],
                'return_from_customer' => ['read', 'delete', 'approve', 'print'],
                'return_to_supplier' => ['create', 'read', 'update', 'approve', 'print'],
                'customer_profile' => ['create', 'read', 'update'],
                'credit_rating' => ['read', 'approve'],
                'price_and_discount' => ['read'],
                'price_analysis_report' => ['read', 'print'],
                'item_wholesale_discount' => ['create', 'read', 'update'],
                'override_order_wholesale_discount' => ['read', 'update'],
                'inventory' => ['read', 'print'],
                'stock_in' => ['read', 'print'],
                'reports_and_analytics' => ['read', 'print'],
                'inventory_reports' => ['read', 'print'],
                'item_management' => ['read'],
            ],
            'inventory_officer' => [
                'all_orders' => ['read', 'print'],
                'customer_orders_pickup' => ['read'],
                'inventory' => ['create', 'read', 'print'],
                'stock_in' => ['create', 'read', 'print'],
                'stock_transfer' => ['create', 'read', 'delete'],
                'stock_alert' => ['read'],
                'customer_order_withdrawal' => ['read'],
                'return_to_supplier' => ['read', 'print'],
                'return_from_customer' => ['create', 'read', 'print'],
                'item_management' => ['create', 'read', 'update'],
                'convert_item' => ['read'],
                'reports_and_analytics' => ['read', 'print'],
            ],
            'administrator' => [
                'user_management' => ['create', 'read', 'update', 'delete'],
                'project_management' => ['create', 'read', 'update', 'delete'],
                'tenant_management' => ['read', 'update', 'delete'],
                'api_key_management' => ['create', 'read', 'update', 'delete'],
                'user_access_management' => ['read'],
                'reports_and_analytics' => ['read', 'print'],
            ],
            'super_admin' => [
                'create_order' => ['create', 'read', 'update', 'delete', 'print'],
                'receive_payment' => ['create', 'read', 'update', 'print'],
                'all_orders' => ['create', 'read', 'update', 'approve', 'print'],
                'customer_orders_pickup' => ['create', 'read', 'update', 'approve', 'print'],
                'return_from_customer' => ['create', 'read', 'update', 'approve', 'print'],
                'return_to_supplier' => ['create', 'read', 'update', 'approve', 'print'],
                'customer_profile' => ['create', 'read', 'update', 'approve', 'print'],
                'credit_rating' => ['create', 'read', 'update', 'approve', 'print'],
                'inventory' => ['create', 'read', 'update', 'approve', 'print'],
                'stock_in' => ['create', 'read', 'update', 'approve', 'print'],
                'stock_transfer' => ['create', 'read', 'update', 'approve', 'print'],
                'stock_alert' => ['create', 'read', 'update', 'approve', 'print'],
                'inventory_reports' => ['create', 'read', 'update', 'approve', 'print'],
                'customer_order_withdrawal' => ['create', 'read', 'update', 'approve', 'print'],
                'item_management' => ['create', 'read', 'update', 'approve', 'print'],
                'convert_item' => ['create', 'read', 'update', 'approve', 'print'],
                'price_and_discount' => ['create', 'read', 'update', 'approve', 'print'],
                'price_analysis_report' => ['create', 'read', 'update', 'approve', 'print'],
                'reports_and_analytics' => ['create', 'read', 'update', 'approve', 'print'],
                'user_management' => ['create', 'read', 'update', 'approve', 'print'],
                'project_management' => ['create', 'read', 'update', 'approve', 'print'],
                'tenant_management' => ['create', 'read', 'update', 'approve', 'print'],
                'api_key_management' => ['create', 'read', 'update', 'approve', 'print'],
                'user_access_management' => ['create', 'read', 'update', 'approve', 'print'],
                'item_wholesale_discount' => ['create', 'read', 'update', 'approve', 'print'],
                'override_order_wholesale_discount' => ['create', 'read', 'update', 'approve', 'print'],
                'quotation' => ['create', 'read', 'update', 'delete', 'approve', 'print'],
                'order_receipt' => ['create', 'read', 'update', 'delete', 'approve', 'print'],
            ],
        ];

        foreach ($matrix as $roleKey => $features) {
            $role = $getRole($roleKey);
            if (! $role) {
                continue;
            }

            foreach ($features as $featureKey => $permissionSlugs) {
                $feature = $getFeat($featureKey);
                if (! $feature) {
                    continue;
                }

                foreach ($permissionSlugs as $slug) {
                    if (! isset($perms[$slug])) {
                        continue;
                    }

                    DB::table('role_feature_permissions')->insertOrIgnore([
                        'role_id' => $role->id,
                        'feature_id' => $feature->id,
                        'permission_id' => $perms[$slug],
                    ]);
                }
            }
        }
    }
}
