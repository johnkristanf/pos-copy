<?php

namespace App\Models;

use App\Events\OrderItemServeLocationModified;
use App\Http\Traits\HasActivityLog;
use DB;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $order_item_id
 * @property int $stock_location_id
 * @property int $quantity_to_serve
 * @property int $quantity_served
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\OrderItem $order_item
 * @property-read \App\Models\StockLocation $stock_location
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItemServeLocation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItemServeLocation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItemServeLocation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItemServeLocation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItemServeLocation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItemServeLocation whereOrderItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItemServeLocation whereQuantityServed($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItemServeLocation whereQuantityToServe($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItemServeLocation whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItemServeLocation whereStockLocationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderItemServeLocation whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class OrderItemServeLocation extends Model
{
    use HasActivityLog;

    protected $guarded = ['id'];

    protected static function booted(): void
    {
        static::updated(function (OrderItemServeLocation $serveLocation) {
            $changes = $serveLocation->getChanges();
            unset($changes['updated_at']);

            if (empty($changes)) {
                return;
            }

            DB::afterCommit(function () use ($serveLocation, $changes) {
                OrderItemServeLocationModified::dispatch($serveLocation, 'updated');

                $serveLocation->logActivity(
                    logName: 'order_serving',
                    description: 'Order item serving updated',
                    causer: auth()->user(),
                    properties: [
                        'order_item_id' => $serveLocation->order_item_id,
                        'stock_location_id' => $serveLocation->stock_location_id,
                        'old' => $serveLocation->getOriginal(),
                        'attributes' => $changes,
                    ],
                    event: 'updated'
                );
            });
        });
    }

    public function order_item()
    {
        return $this->belongsTo(OrderItem::class, 'order_item_id');
    }

    public function stock_location()
    {
        return $this->belongsTo(StockLocation::class, 'stock_location_id');
    }
}
