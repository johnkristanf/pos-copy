<?php

namespace Database\Seeders;

use DB;
use Illuminate\Database\Seeder;

class PaymentMethodsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('payment_methods')->insert([
            [
                'tag' => 'cash',
                'name' => 'Cash',
                'description' => 'For physical money payments. Count cash received and provide exact change.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tag' => 'credit',
                'name' => 'Credit',
                'description' => 'For pay-later transactions. Requires customer registration and payment terms.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tag' => 'check',
                'name' => 'Check',
                'description' => 'For check payments. Ensure check validity and proper endorsement before accepting.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'tag' => 'bank_transfer',
                'name' => 'Bank Transfer',
                'description' => 'For direct bank-to-bank transfers. Confirm transaction with official bank proof before order fulfillment.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
