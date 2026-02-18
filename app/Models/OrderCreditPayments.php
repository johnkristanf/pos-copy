<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $order_credits_id
 * @property numeric $amount
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\OrderCredits $order_credits
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCreditPayments newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCreditPayments newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCreditPayments query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCreditPayments whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCreditPayments whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCreditPayments whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCreditPayments whereOrderCreditsId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderCreditPayments whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class OrderCreditPayments extends Model
{
    protected $guarded = ['id'];

    public function order_credits()
    {
        return $this->belongsTo(OrderCredits::class, 'order_credits_id');
    }
}
