<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $item_id
 * @property numeric|null $unit_price
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Items $item
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemPurchasePricesLog newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemPurchasePricesLog newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemPurchasePricesLog query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemPurchasePricesLog whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemPurchasePricesLog whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemPurchasePricesLog whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemPurchasePricesLog whereUnitPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemPurchasePricesLog whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class ItemPurchasePricesLog extends Model
{
    protected $guarded = ['id'];

    public function item()
    {
        return $this->belongsTo(Items::class, 'item_id');
    }
}
