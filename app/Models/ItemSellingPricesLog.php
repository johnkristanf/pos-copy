<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property numeric|null $unit_price
 * @property numeric|null $wholesale_price
 * @property numeric|null $credit_price
 * @property int $item_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Items $item
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemSellingPricesLog newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemSellingPricesLog newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemSellingPricesLog query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemSellingPricesLog whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemSellingPricesLog whereCreditPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemSellingPricesLog whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemSellingPricesLog whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemSellingPricesLog whereUnitPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemSellingPricesLog whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemSellingPricesLog whereWholesalePrice($value)
 * @mixin \Eloquent
 */
class ItemSellingPricesLog extends Model
{
    protected $guarded = ['id'];

    public function item()
    {
        return $this->belongsTo(Items::class, 'item_id');
    }
}
