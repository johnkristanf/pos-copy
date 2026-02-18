<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property int $order_id
 * @property int $item_id
 * @property int $selected_uom_id
 * @property string $status
 * @property int|null $served_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read mixed $quantity
 * @property-read \App\Models\Items $item
 * @property-read \App\Models\Orders $order
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $order_user_status
 * @property-read int|null $order_user_status_count
 * @property-read \App\Models\UnitOfMeasure $selected_uom
 * @property-read \App\Models\OrderItemServeLocation|null $serve_locations
 * @property-read \App\Models\User|null $servedBy
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereSelectedUomId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereServedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItem withoutTrashed()
 *
 * @mixin \Eloquent
 */
class OrderItem extends Model
{
    use SoftDeletes;

    protected $guarded = ['id'];

    protected $appends = ['quantity'];

    public function order()
    {
        return $this->belongsTo(Orders::class, 'order_id');
    }

    public function item()
    {
        return $this->belongsTo(Items::class, 'item_id');
    }

    public function selected_uom()
    {
        return $this->belongsTo(UnitOfMeasure::class, 'selected_uom_id');
    }

    public function order_user_status()
    {
        return $this->belongsToMany(User::class, 'order_user_status', 'order_item_id', 'user_id')
            ->withPivot('status');
    }

    public function serve_locations()
    {
        return $this->hasOne(OrderItemServeLocation::class, 'order_item_id');
    }

    public function servedBy()
    {
        return $this->belongsTo(User::class, 'served_by');
    }

    public function getQuantityAttribute()
    {
        if ($this->relationLoaded('serve_locations')) {
            return $this->serve_locations?->quantity_to_serve ?? 0;
        }

        return 0;
    }
}
