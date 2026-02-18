<?php

namespace App\Http\Resources\Items;

use App\Models\Items;

class GetPaginatedPricesResource
{
    public static function transform(Items $item): array
    {
        $committedStocks = 0;
        $availableQuantity = 0;
        $locations = [];

        foreach ($item->stocks as $stock) {
            $committedStocks += $stock->committed_quantity;
            $availableQuantity += $stock->available_quantity;

            if (! $stock->stock_location) {
                continue;
            }

            $locId = $stock->stock_location->id;

            if (isset($locations[$locId])) {
                continue;
            }

            $locations[$locId] = [
                'id' => $locId,
                'tag' => $stock->stock_location->tag ?? null,
                'name' => $stock->stock_location->name,
            ];
        }

        $sellingPrice = $item->sellingPrices;

        return [
            'id' => $item->id,
            'sku' => $item->sku,
            'description' => $item->description,
            'image_url' => $item->image_url,
            'size' => $item->size,
            'brand' => $item->brand,
            'color' => $item->color,
            'updatedAt' => $item->updated_at,
            'category' => $item->category ? [
                'id' => $item->category->id,
                'code' => $item->category->code,
                'name' => $item->category->name,
            ] : null,
            'supplier' => $item->supplier ? [
                'id' => $item->supplier->id,
                'name' => $item->supplier->name,
            ] : null,
            'committed_stocks' => $committedStocks,
            'available_stocks' => $availableQuantity,
            'conversion_units' => $item->conversion_units,
            'locations' => array_values($locations),
            'selling_prices' => $sellingPrice ? [
                'unit_price' => $sellingPrice->unit_price,
                'wholesale_price' => $sellingPrice->wholesale_price,
                'credit_price' => $sellingPrice->credit_price,
            ] : null,
        ];
    }
}
