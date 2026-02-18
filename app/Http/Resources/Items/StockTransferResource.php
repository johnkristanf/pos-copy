<?php

namespace App\Http\Resources\Items;

use App\Models\StockTransfer;

class StockTransferResource
{
    public static function transform(StockTransfer $transfer): array
    {
        return [
            'id' => $transfer->id,
            'quantity' => $transfer->quantity,
            'created_at' => $transfer->created_at?->toDateTimeString(),
            'updated_at' => $transfer->updated_at?->toDateTimeString(),
            'item' => $transfer->item ? [
                'id' => $transfer->item->id,
                'sku' => $transfer->item->sku,
                'description' => $transfer->item->description,
                'brand' => $transfer->item->brand,
                'color' => $transfer->item->color,
                'size' => $transfer->item->size,
                'category_id' => $transfer->item->category_id,
                'supplier_id' => $transfer->item->supplier_id,
            ] : null,
            'source_stock_location' => $transfer->source_stock_location ? [
                'id' => $transfer->source_stock_location->id,
                'name' => $transfer->source_stock_location->name,
                'tag' => $transfer->source_stock_location->tag,
            ] : null,
            'destination_stock_location' => $transfer->destination_stock_location ? [
                'id' => $transfer->destination_stock_location->id,
                'name' => $transfer->destination_stock_location->name,
                'tag' => $transfer->destination_stock_location->tag,
            ] : null,
        ];
    }
}
