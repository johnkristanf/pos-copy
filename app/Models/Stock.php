<?php

namespace App\Models;

use App\Events\StockModified;
use App\Http\Traits\HasActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * @property int $id
 * @property int $available_quantity
 * @property int $committed_quantity
 * @property int $location_id
 * @property int $item_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Items> $itemComponents
 * @property-read int|null $item_components_count
 * @property-read \App\Models\Items $items
 * @property-read \App\Models\StockLocation $location
 * @property-read \App\Models\StockLocation $stock_location
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereAvailableQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereCommittedQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereLocationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Stock whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class Stock extends Model
{
    use HasActivityLog;

    public const INCREASE = 'increase';

    public const DEDUCT = 'deduct';

    protected $guarded = ['id'];

    protected static function booted(): void
    {
        static::created(function (Stock $stock) {
            DB::afterCommit(function () use ($stock) {
                StockModified::dispatch($stock, 'created');
                $stock->logActivity(
                    logName: 'stock',
                    description: 'Stock record created',
                    causer: auth()->user(),
                    properties: [
                        'item_id' => $stock->item_id,
                        'location_id' => $stock->location_id,
                        'available_quantity' => $stock->available_quantity,
                    ],
                    event: 'created'
                );
            });
        });

        static::updated(function (Stock $stock) {
            $changes = $stock->getChanges();
            unset($changes['updated_at']);

            if (empty($changes)) {
                return;
            }

            DB::afterCommit(function () use ($stock, $changes) {
                StockModified::dispatch($stock, 'updated');
                $stock->logActivity(
                    logName: 'stock',
                    description: 'Stock record updated',
                    causer: auth()->user(),
                    properties: [
                        'item_id' => $stock->item_id,
                        'old' => $stock->getOriginal(),
                        'attributes' => $changes,
                    ],
                    event: 'updated'
                );
            });
        });

        static::deleted(function (Stock $stock) {
            DB::afterCommit(function () use ($stock) {
                StockModified::dispatch($stock, 'deleted');
                $stock->logActivity(
                    logName: 'stock',
                    description: 'Stock record deleted',
                    causer: auth()->user(),
                    properties: [
                        'item_id' => $stock->item_id,
                        'location_id' => $stock->location_id,
                    ],
                    event: 'deleted'
                );
            });
        });
    }

    public function location()
    {
        return $this->belongsTo(StockLocation::class, 'location_id');
    }

    public function items()
    {
        return $this->belongsTo(Items::class, 'item_id');
    }

    public function itemComponents()
    {
        return $this->belongsToMany(Items::class, 'item_components', 'stock_id', 'item_id')
            ->withPivot('quantity');
    }

    public function stock_location()
    {
        return $this->belongsTo(StockLocation::class, 'location_id');
    }
}
