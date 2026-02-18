<?php

namespace Database\Seeders;

use App\Models\UnitOfMeasure;
use Illuminate\Database\Seeder;

class UnitOfMeasureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $units = [
            [
                'code' => 'UNIT',
                'name' => 'Unit',
            ],

            [
                'code' => 'PCS',
                'name' => 'Pieces',
            ],
            [
                'code' => 'KG',
                'name' => 'Kilograms',
            ],
            [
                'code' => 'G',
                'name' => 'Grams',
            ],
            [
                'code' => 'MG',
                'name' => 'Milligrams',
            ],
            [
                'code' => 'L',
                'name' => 'Liters',
            ],
            [
                'code' => 'M',
                'name' => 'Meters',
            ],
            [
                'code' => 'BOX',
                'name' => 'Box',
            ],
            [
                'code' => 'BUNDLE',
                'name' => 'Bundle',
            ],
            [
                'code' => 'SET',
                'name' => 'Set',
            ],
            [
                'code' => 'ROLL',
                'name' => 'Roll',
            ],
        ];

        foreach ($units as $unit) {
            UnitOfMeasure::create($unit);
        }
    }
}
