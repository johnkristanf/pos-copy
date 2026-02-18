<?php

namespace Database\Seeders;

use App\Models\KeyExpirationOption;
use Illuminate\Database\Seeder;

class KeyExpirationOptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $expirationOptions = [
            [
                'slug' => '1_day',
                'name' => '1 Day',
            ],
            [
                'slug' => '7_days',
                'name' => '7 Days',
            ],
            [
                'slug' => '30_days',
                'name' => '30 Days',
            ],
            [
                'slug' => '90_days',
                'name' => '90 Days',
            ],
            [
                'slug' => '1_year',
                'name' => '1 Year',
            ],
            [
                'slug' => 'no_expiration',
                'name' => 'Never Expires',
            ],
        ];

        foreach ($expirationOptions as $option) {
            KeyExpirationOption::updateOrCreate(
                ['slug' => $option['slug']],
                $option
            );
        }
    }
}
