<?php

namespace Database\Seeders;

use DB;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('companies')->insert([
            [
                'name' => 'USI - Underground Supply Industry',
                'created_at' => now(),
                'updated_at' => now(),
            ],

        ]);
    }
}
