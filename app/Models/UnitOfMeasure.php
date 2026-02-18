<?php

namespace App\Models;

use App\Events\UnitOfMeasureModified;
use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

/**
 * @property int $id
 * @property string $code
 * @property string $name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ItemConversionUnit> $baseConversionUnits
 * @property-read int|null $base_conversion_units_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\OrderItem> $order_items
 * @property-read int|null $order_items_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ItemConversionUnit> $purchaseConversionUnits
 * @property-read int|null $purchase_conversion_units_count
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnitOfMeasure newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnitOfMeasure newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnitOfMeasure query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnitOfMeasure whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnitOfMeasure whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnitOfMeasure whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnitOfMeasure whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UnitOfMeasure whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class UnitOfMeasure extends Model
{
    use Searchable;

    protected $table = 'unit_of_measures';

    protected $guarded = ['id'];

    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
        ];
    }

    public function purchaseConversionUnits()
    {
        return $this->hasMany(ItemConversionUnit::class, 'purchase_uom_id');
    }

    public function baseConversionUnits()
    {
        return $this->hasMany(ItemConversionUnit::class, 'base_uom_id');
    }

    public function order_items()
    {
        return $this->hasMany(OrderItem::class, 'selected_uom_id');
    }

    protected static function boot()
    {
        parent::boot();

        static::created(function (UnitOfMeasure $unit) {
            UnitOfMeasureModified::dispatch($unit, 'created');
        });

        static::updated(function (UnitOfMeasure $unit) {
            UnitOfMeasureModified::dispatch($unit, 'updated');
        });

        static::deleted(function (UnitOfMeasure $unit) {
            UnitOfMeasureModified::dispatch($unit, 'deleted');
        });
    }
}
