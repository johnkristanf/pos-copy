<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VoidReasonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (DB::table('void_reasons')->count() > 0) {
            return;
        }

        DB::table('void_reasons')->insert([
            [
                'void_reason' => 'Customer Changed Mind',
                'require_password' => false,
                'immediate_refund' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'void_reason' => 'Wrong Item Scanned',
                'require_password' => false,
                'immediate_refund' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'void_reason' => 'Price Discrepancy',
                'require_password' => true,
                'immediate_refund' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'void_reason' => 'Manager Override',
                'require_password' => true,
                'immediate_refund' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'void_reason' => 'System Error',
                'require_password' => false,
                'immediate_refund' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
