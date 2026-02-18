<?php

namespace Database\Seeders;

use App\Models\Items;
use App\Models\StockLocation;
use App\Services\ItemsService;
use Illuminate\Database\Seeder;

class ItemSeeder extends Seeder
{
    public function __construct(protected ItemsService $itemsService) {}

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $locations = StockLocation::all();
        // Fetch all item categories, indexed by name for easy id lookup
        $categoryByName = \App\Models\ItemCategory::all()->keyBy('name');

        if ($locations->isEmpty()) {
            $this->command->warn('No stock locations found. Skipping stock creation.');
        }

        $items = [
            [
                'sku' => $this->itemsService->generateItemSku('Equipment', $categoryByName['Equipment']->id),
                'description' => 'BAGGER MIXER LOWSPEED GASOLINE',
                'brand' => 'N/A',
                'color' => 'N/A',
                'size' => 'N/A',
                'min_quantity' => 5,
                'max_quantity' => 100,
                'category_id' => $categoryByName['Equipment']->id,
                'supplier_id' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
                'conversion_units' => [
                    ['purchase_uom_id' => 1, 'base_uom_id' => 1, 'conversion_factor' => 1],
                ],
            ],
            [
                'sku' => $this->itemsService->generateItemSku('Electrical', $categoryByName['Electrical']->id),
                'description' => 'GANG BOX TERMINAL BLOCK  W/ DIN RAIL TYPE',
                'brand' => 'N/A',
                'color' => 'N/A',
                'size' => 'N/A',
                'min_quantity' => 5,
                'max_quantity' => 100,
                'category_id' => $categoryByName['Electrical']->id,
                'supplier_id' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
                'conversion_units' => [
                    ['purchase_uom_id' => 2, 'base_uom_id' => 2, 'conversion_factor' => 1],
                ],
            ],

            [
                'sku' => $this->itemsService->generateItemSku('Hand Tool', $categoryByName['Hand Tool']->id),
                'description' => 'GREENFIELD TIN SNIPS',
                'brand' => 'Greenfield',
                'color' => 'N/A',
                'size' => '12"',
                'min_quantity' => 5,
                'max_quantity' => 100,
                'category_id' => $categoryByName['Hand Tool']->id,
                'supplier_id' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
                'conversion_units' => [
                    ['purchase_uom_id' => 2, 'base_uom_id' => 2, 'conversion_factor' => 1],
                ],
            ],

            [
                'sku' => $this->itemsService->generateItemSku('Battery', $categoryByName['Battery']->id),
                'description' => 'Automotive Battery',
                'brand' => '3K',
                'color' => 'N/A',
                'size' => 'N100L / 15 Plates',
                'min_quantity' => 5,
                'max_quantity' => 100,
                'category_id' => $categoryByName['Battery']->id,
                'supplier_id' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
                'conversion_units' => [
                    ['purchase_uom_id' => 1, 'base_uom_id' => 1, 'conversion_factor' => 1],
                ],
            ],

            [
                'sku' => $this->itemsService->generateItemSku('Roll', $categoryByName['Roll']->id),
                'description' => 'Floor Sanding Paper',
                'brand' => '3M',
                'color' => 'N/A',
                'size' => '12"',
                'min_quantity' => 5,
                'max_quantity' => 100,
                'category_id' => $categoryByName['Roll']->id,
                'supplier_id' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
                'conversion_units' => [
                    ['purchase_uom_id' => 11, 'base_uom_id' => 11, 'conversion_factor' => 1],
                ],
            ],
        ];

        foreach ($items as $itemData) {
            $price = $itemData['price'] ?? null;
            $conversionUnits = $itemData['conversion_units'] ?? [];

            unset($itemData['price']);
            unset($itemData['conversion_units']);

            $item = Items::create($itemData);

            if ($price !== null) {
                $item->sellingPrices()->create([
                    'unit_price' => $price,
                ]);
            }

            foreach ($conversionUnits as $unitData) {
                $item->conversion_units()->create([
                    'purchase_uom_id' => $unitData['purchase_uom_id'],
                    'base_uom_id' => $unitData['base_uom_id'],
                    'conversion_factor' => $unitData['conversion_factor'],
                ]);
            }

        }
    }
}
