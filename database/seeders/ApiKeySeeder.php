<?php

namespace Database\Seeders;

use App\Models\ApiKeys;
use App\Models\Apps;
use App\Models\Features;
use App\Models\KeyExpirationOption;
use App\Models\Permissions;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ApiKeySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $app = Apps::query()->where('slug', 'usi_bridgepro')->first();

        if (! $app) {
            $this->command->warn('USI BridgePRO app not found. Please run AppsSeeder first.');

            return;
        }

        $neverExpiration = KeyExpirationOption::query()->where('slug', 'no_expiration')->first();

        if (! $neverExpiration) {
            $this->command->warn('"Never" expiration option not found. Please run KeyExpirationOptionSeeder first.');

            return;
        }

        $stockFeatures = Features::query()->whereIn('tag', [
            'stock_management',
            'stock_locations',
            'stock_transfers',
            'stock_adjustments',
            'inventory',
            'items',
            'item_categories',
            'unit_of_measures',
            'suppliers',
        ])->get();

        if ($stockFeatures->isEmpty()) {
            $this->command->warn('No stock features found. Please run FeaturesSeeder first.');

            return;
        }

        $permissions = Permissions::query()->whereIn('name', ['create', 'read', 'update', 'delete'])->get();

        if ($permissions->isEmpty()) {
            $this->command->warn('No permissions found. Please run PermissionsSeeder first.');

            return;
        }

        DB::beginTransaction();

        try {
            $apiKey = ApiKeys::create([
                'type' => 'inbound',
                'label' => 'USI BridgePRO - Stock Management (Dev)',
                'key' => 'dev_'.Str::random(64),
                'isactive' => true,
                'app_id' => $app->slug,
                'key_expiration_id' => $neverExpiration->id,
                'last_used_at' => null,
                'last_rolled_at' => null,
                'expires_at' => null,
            ]);

            $pivotData = [];

            foreach ($stockFeatures as $feature) {
                foreach ($permissions as $permission) {
                    $pivotData[] = [
                        'api_key_id' => $apiKey->id,
                        'feature_id' => $feature->id,
                        'permission_id' => $permission->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }

            DB::table('api_key_feature_permissions')->insert($pivotData);

            DB::commit();

            $this->command->info('API Key created successfully for USI BridgePRO');
            $this->command->info("API Key: {$apiKey->key}");
            $this->command->info("Features: {$stockFeatures->count()}");
            $this->command->info("Permissions per feature: {$permissions->count()}");
            $this->command->info('Total permissions: '.\count($pivotData));

        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Failed to create API Key: '.$e->getMessage());
            throw $e;
        }
    }
}
