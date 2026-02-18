<?php

namespace App\Models;

use App\Events\PurchasedItemModified;
use App\Http\Traits\HasActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * @property int $id
 * @property string $purchase_order_item_id
 * @property int $purchased_quantity
 * @property int|null $stocked_in_quantity
 * @property numeric|null $discount
 * @property numeric|null $unit_price
 * @property int $purchase_id
 * @property int $item_id
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Items $item
 * @property-read \App\Models\PurchasedItemUOM|null $purchase_item_uom
 * @property-read \App\Models\Purchased $purchased
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchasedItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchasedItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchasedItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchasedItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchasedItem whereDiscount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchasedItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchasedItem whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchasedItem wherePurchaseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchasedItem wherePurchaseOrderItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchasedItem wherePurchasedQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchasedItem whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchasedItem whereStockedInQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchasedItem whereUnitPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PurchasedItem whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class PurchasedItem extends Model
{
    use HasActivityLog;

    public const STATUS_PENDING = 'pending';

    public const STATUS_PARTIALLY_STOCK_IN = 'partially_stock_in';

    public const STATUS_FULLY_STOCKED_IN = 'fully_stocked_in';

    protected $guarded = ['id'];

    public function purchased()
    {
        return $this->belongsTo(Purchased::class, 'purchase_id');
    }

    public function item()
    {
        return $this->belongsTo(Items::class, 'item_id');
    }

    public function purchase_item_uom()
    {
        return $this->hasOne(PurchasedItemUOM::class, 'purchased_item_id');
    }

    protected static function booted(): void
    {
        static::created(function (PurchasedItem $purchasedItem) {
            DB::afterCommit(function () use ($purchasedItem) {
                PurchasedItemModified::dispatch($purchasedItem, 'created');
                $purchasedItem->logActivity(
                    logName: 'purchased_items',
                    description: "Purchased item created for Purchase ID: {$purchasedItem->purchase_id}",
                    causer: auth()->user(),
                    properties: [
                        'purchase_id' => $purchasedItem->purchase_id,
                        'item_id' => $purchasedItem->item_id,
                        'quantity' => $purchasedItem->purchased_quantity,
                    ],
                    event: 'created'
                );
            });
        });

        static::updated(function (PurchasedItem $purchasedItem) {
            $changes = $purchasedItem->getChanges();
            unset($changes['updated_at']);

            if (empty($changes)) {
                return;
            }

            DB::afterCommit(function () use ($purchasedItem, $changes) {
                PurchasedItemModified::dispatch($purchasedItem, 'updated');
                $purchasedItem->logActivity(
                    logName: 'purchased_items',
                    description: "Purchased item updated for Purchase ID: {$purchasedItem->purchase_id}",
                    causer: auth()->user(),
                    properties: [
                        'purchase_id' => $purchasedItem->purchase_id,
                        'item_id' => $purchasedItem->item_id,
                        'old' => $purchasedItem->getOriginal(),
                        'attributes' => $changes,
                    ],
                    event: 'updated'
                );
            });
        });

        static::deleted(function (PurchasedItem $purchasedItem) {
            DB::afterCommit(function () use ($purchasedItem) {
                PurchasedItemModified::dispatch($purchasedItem, 'deleted');
                $purchasedItem->logActivity(
                    logName: 'purchased_items',
                    description: "Purchased item deleted for Purchase ID: {$purchasedItem->purchase_id}",
                    causer: auth()->user(),
                    properties: [
                        'purchase_id' => $purchasedItem->purchase_id,
                        'item_id' => $purchasedItem->item_id,
                    ],
                    event: 'deleted'
                );
            });
        });
    }
}
