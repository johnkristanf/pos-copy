<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $purchased_item_id
 * @property string $code
 * @property string $name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\PurchasedItem $purchaseItem
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchasedItemUOM newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchasedItemUOM newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchasedItemUOM query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchasedItemUOM whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchasedItemUOM whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchasedItemUOM whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchasedItemUOM wherePurchasedItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchasedItemUOM whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class PurchasedItemUOM extends Model
{
    protected $table = 'purchased_item_uoms';

    protected $guarded = ['id'];

    public function purchaseItem()
    {
        return $this->belongsTo(PurchasedItem::class, 'purchased_item_id');
    }
}
