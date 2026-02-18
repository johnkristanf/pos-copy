<?php

namespace Database\Seeders;

use App\Models\ItemCategory;
use Illuminate\Database\Seeder;

class ItemCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'code' => 'EQUIP',
                'name' => 'Equipment',
            ],
            [
                'code' => 'ELEC',
                'name' => 'Electrical',
            ],
            [
                'code' => 'HTOOL',
                'name' => 'Hand Tool',
            ],
            [
                'code' => 'LUB',
                'name' => 'Lubricant',
            ],
            [
                'code' => 'PAINT',
                'name' => 'Paint',
            ],
            [
                'code' => 'MACH',
                'name' => 'Machine',
            ],
            [
                'code' => 'APPL',
                'name' => 'Appliance',
            ],
            [
                'code' => 'ACC',
                'name' => 'Accessory',
            ],
            [
                'code' => 'BATT',
                'name' => 'Battery',
            ],
            [
                'code' => 'ABR',
                'name' => 'Abrasive',
            ],
            [
                'code' => 'TIRE',
                'name' => 'Tire',
            ],
            [
                'code' => 'CHEM',
                'name' => 'Chemical',
            ],
            [
                'code' => 'AUTO',
                'name' => 'Automotive Part',
            ],
            [
                'code' => 'ROLL',
                'name' => 'Roll',
            ],
        ];

        foreach ($categories as $category) {
            ItemCategory::create($category);
        }
    }
}
