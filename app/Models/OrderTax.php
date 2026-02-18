<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $order_id
 * @property numeric $amount
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Orders $order
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderTax newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderTax newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderTax query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderTax whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderTax whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderTax whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderTax whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderTax whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class OrderTax extends Model
{
    protected $guarded = ['id'];

    public function order()
    {
        return $this->belongsTo(Orders::class, 'order_id');
    }
}
