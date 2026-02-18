<?php

namespace Database\Seeders;

use DB;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $locations = [
            [
                'country' => 'Philippines',
                'region' => 'NCR',
                'province' => 'Metro Manila',
                'municipality' => 'Quezon City',
                'barangay' => 'Bago Bantay',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'country' => 'Philippines',
                'region' => 'NCR',
                'province' => 'Metro Manila',
                'municipality' => 'Makati',
                'barangay' => 'San Lorenzo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'country' => 'Philippines',
                'region' => 'CALABARZON',
                'province' => 'Laguna',
                'municipality' => 'Biñan',
                'barangay' => 'Sto. Tomas',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('locations')->insert($locations);

    }
}
