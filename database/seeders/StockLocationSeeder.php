<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StockLocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (DB::table('stock_locations')->count() > 0) {
            return;
        }

        DB::table('stock_locations')->insert([
            [
                'tag' => 'store',
                'name' => 'Store',
                'branch_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tag' => 'warehouse',
                'name' => 'Warehouse',
                'branch_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
