<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $item_id
 * @property int $source_stock_location_id
 * @property int $destination_stock_location_id
 * @property int $quantity
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\StockLocation $destination_stock_location
 * @property-read \App\Models\Items $item
 * @property-read \App\Models\StockLocation $source_stock_location
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereDestinationStockLocationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereSourceStockLocationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockTransfer whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class StockTransfer extends Model
{
    protected $guarded = ['id'];

    public function item()
    {
        return $this->belongsTo(Items::class, 'item_id');
    }

    public function source_stock_location()
    {
        return $this->belongsTo(StockLocation::class, 'source_stock_location_id');
    }

    public function destination_stock_location()
    {
        return $this->belongsTo(StockLocation::class, 'destination_stock_location_id');
    }
}
