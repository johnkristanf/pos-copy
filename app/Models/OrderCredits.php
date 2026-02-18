<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property numeric $amount
 * @property int $order_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Orders $order
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\OrderCreditPayments> $order_credit_payments
 * @property-read int|null $order_credit_payments_count
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCredits newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCredits newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCredits query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCredits whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCredits whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCredits whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCredits whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCredits whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class OrderCredits extends Model
{
    protected $guarded = ['id'];

    public function order()
    {
        return $this->belongsTo(Orders::class, 'order_id');
    }

    public function order_credit_payments()
    {
        return $this->hasMany(OrderCreditPayments::class, 'order_credits_id');
    }
}
