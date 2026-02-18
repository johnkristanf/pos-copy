<?php

namespace Database\Seeders;

use App\Models\Features;
use Illuminate\Database\Seeder;

class FeaturesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $featuresConfig = config('features');
        $features = [];

        foreach ($featuresConfig as $feature) {
            $features[] = [
                'tag' => $feature['tag'],
                'name' => $feature['name'],
            ];
        }

        foreach ($features as $feature) {
            Features::create($feature);
        }
    }
}
