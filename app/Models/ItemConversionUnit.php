<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $item_id
 * @property int $purchase_uom_id
 * @property int|null $base_uom_id
 * @property numeric $conversion_factor
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\UnitOfMeasure|null $base_uom
 * @property-read \App\Models\Items $item
 * @property-read \App\Models\UnitOfMeasure $purchase_uom
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemConversionUnit newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemConversionUnit newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemConversionUnit query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemConversionUnit whereBaseUomId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemConversionUnit whereConversionFactor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemConversionUnit whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemConversionUnit whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemConversionUnit whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemConversionUnit wherePurchaseUomId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemConversionUnit whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class ItemConversionUnit extends Model
{
    protected $guarded = ['id'];

    public function item()
    {
        return $this->belongsTo(Items::class, 'item_id');
    }

    public function purchase_uom()
    {
        return $this->belongsTo(UnitOfMeasure::class, 'purchase_uom_id');
    }

    public function base_uom()
    {
        return $this->belongsTo(UnitOfMeasure::class, 'base_uom_id');
    }
}
