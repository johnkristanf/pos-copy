<?php

namespace Database\Seeders;

use DB;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('branches')->insert([
            [
                'name' => 'USI - Main Branch',
                'address' => 'Tagum City, Davao del Norte',
                'email' => 'usi@gmail.com',
                'contact_number' => '0912-345-6789',
                'company_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
