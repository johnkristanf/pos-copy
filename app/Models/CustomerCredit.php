<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int|null $rating
 * @property numeric $limit
 * @property numeric $balance
 * @property int $term
 * @property int $customer_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Customers $customer
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomerCredit newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomerCredit newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomerCredit query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomerCredit whereBalance($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomerCredit whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomerCredit whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomerCredit whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomerCredit whereLimit($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomerCredit whereRating($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomerCredit whereTerm($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CustomerCredit whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class CustomerCredit extends Model
{
    protected $guarded = ['id'];

    public function customer()
    {
        return $this->belongsTo(Customers::class, 'customer_id');
    }
}
