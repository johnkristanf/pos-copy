<?php

namespace Database\Seeders;

use App\Models\Apps;
use Illuminate\Database\Seeder;

class AppsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $systems = [

            [
                'slug' => 'usi_bridgepro',
                'name' => 'USI BridgePRO',
            ],
        ];

        foreach ($systems as $system) {
            Apps::create($system);
        }
    }
}
