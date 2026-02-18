<?php

namespace App\Models;

use App\Events\StockLocationModified;
use App\Http\Traits\HasActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * @property int $id
 * @property string $tag
 * @property string $name
 * @property int $branch_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $assigned_users
 * @property-read int|null $assigned_users_count
 * @property-read \App\Models\Branch $branch
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Stock> $stock
 * @property-read int|null $stock_count
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockLocation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockLocation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockLocation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockLocation whereBranchId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockLocation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockLocation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockLocation whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockLocation whereTag($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockLocation whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class StockLocation extends Model
{
    use HasActivityLog;

    protected $guarded = ['id'];

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function stock()
    {
        return $this->hasMany(Stock::class, 'location_id');
    }

    public function assigned_users()
    {
        return $this->belongsToMany(
            User::class,
            'user_locations',
            'stock_location_id',
            'user_id'
        );
    }

    protected static function booted(): void
    {
        static::created(function (StockLocation $stockLocation) {
            DB::afterCommit(function () use ($stockLocation) {
                StockLocationModified::dispatch($stockLocation, 'created');
                $stockLocation->logActivity(
                    logName: 'stock_locations',
                    description: "Stock location created: {$stockLocation->name}",
                    causer: auth()->user(),
                    properties: [
                        'tag' => $stockLocation->tag,
                        'name' => $stockLocation->name,
                        'branch_id' => $stockLocation->branch_id,
                    ],
                    event: 'created'
                );
            });
        });

        static::updated(function (StockLocation $stockLocation) {
            $changes = $stockLocation->getChanges();
            unset($changes['updated_at']);

            if (empty($changes)) {
                return;
            }

            DB::afterCommit(function () use ($stockLocation, $changes) {
                StockLocationModified::dispatch($stockLocation, 'updated');
                $stockLocation->logActivity(
                    logName: 'stock_locations',
                    description: "Stock location updated: {$stockLocation->name}",
                    causer: auth()->user(),
                    properties: [
                        'old' => $stockLocation->getOriginal(),
                        'attributes' => $changes,
                    ],
                    event: 'updated'
                );
            });
        });

        static::deleted(function (StockLocation $stockLocation) {
            DB::afterCommit(function () use ($stockLocation) {
                StockLocationModified::dispatch($stockLocation, 'deleted');
                $stockLocation->logActivity(
                    logName: 'stock_locations',
                    description: "Stock location deleted: {$stockLocation->name}",
                    causer: auth()->user(),
                    properties: [
                        'name' => $stockLocation->name,
                        'tag' => $stockLocation->tag,
                    ],
                    event: 'deleted'
                );
            });
        });
    }
}
