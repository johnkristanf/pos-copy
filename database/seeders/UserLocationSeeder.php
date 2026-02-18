<?php

namespace Database\Seeders;

use App\Models\StockLocation;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserLocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $stockLocations = StockLocation::all();

        if ($stockLocations->isEmpty()) {
            return;
        }

        $users = User::whereHas('roles', function ($query) {
            $query->whereIn('code', [config('roles.inventory_manager.code'), config('roles.inventory_officer.code')]);
        })->get();

        $locationAssignment = [
            'Bryan' => config('stocklocations.store.tag'),
            'Melvin' => config('stocklocations.warehouse.tag'),
        ];

        foreach ($users as $user) {
            if (! isset($locationAssignment[$user->first_name])) {
                continue;
            }

            $desiredTag = $locationAssignment[$user->first_name];
            $locationsToAssign = $stockLocations->where('tag', $desiredTag);

            foreach ($locationsToAssign as $stockLocation) {
                $user->assigned_stock_locations()->syncWithoutDetaching($stockLocation->id);
            }
        }
    }
}
