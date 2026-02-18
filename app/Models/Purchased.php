<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $purchase_order_id
 * @property string|null $received_at
 * @property string|null $acknowledgment_receipt
 * @property string|null $remarks
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\PurchasedItem> $items
 * @property-read int|null $items_count
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Purchased newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Purchased newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Purchased query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Purchased whereAcknowledgmentReceipt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Purchased whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Purchased whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Purchased wherePurchaseOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Purchased whereReceivedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Purchased whereRemarks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Purchased whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class Purchased extends Model
{
    protected $table = 'purchased';

    protected $guarded = ['id'];

    public function items()
    {
        return $this->hasMany(PurchasedItem::class, 'purchase_id');
    }
}
