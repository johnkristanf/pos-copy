<?php

namespace App\Models;

use App\Events\PriceModified;
use App\Http\Traits\HasActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * @property int $id
 * @property numeric|null $unit_price
 * @property numeric|null $wholesale_price
 * @property numeric|null $credit_price
 * @property int $item_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Items $item
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemSellingPrice newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemSellingPrice newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemSellingPrice query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemSellingPrice whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemSellingPrice whereCreditPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemSellingPrice whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemSellingPrice whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemSellingPrice whereUnitPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemSellingPrice whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemSellingPrice whereWholesalePrice($value)
 *
 * @mixin \Eloquent
 */
class ItemSellingPrice extends Model
{
    use HasActivityLog;

    protected $guarded = ['id'];

    public function item()
    {
        return $this->belongsTo(Items::class, 'item_id');
    }

    protected static function booted(): void
    {
        static::created(function (ItemSellingPrice $price) {
            DB::afterCommit(function () use ($price) {
                PriceModified::dispatch($price, 'created');
                $price->logActivity(
                    logName: 'selling_prices',
                    description: "Selling prices set for Item ID: {$price->item_id}",
                    causer: auth()->user(),
                    properties: [
                        'item_id' => $price->item_id,
                        'unit_price' => $price->unit_price,
                        'wholesale_price' => $price->wholesale_price,
                        'credit_price' => $price->credit_price,
                    ],
                    event: 'created'
                );
            });
        });

        static::updated(function (ItemSellingPrice $price) {
            $changes = $price->getChanges();
            unset($changes['updated_at']);

            if (empty($changes)) {
                return;
            }

            DB::afterCommit(function () use ($price, $changes) {
                PriceModified::dispatch($price, 'updated');
                $price->logActivity(
                    logName: 'selling_prices',
                    description: "Selling prices updated for Item ID: {$price->item_id}",
                    causer: auth()->user(),
                    properties: [
                        'item_id' => $price->item_id,
                        'old' => $price->getOriginal(),
                        'attributes' => $changes,
                    ],
                    event: 'updated'
                );
            });
        });

        static::deleted(function (ItemSellingPrice $price) {
            DB::afterCommit(function () use ($price) {
                PriceModified::dispatch($price, 'deleted');
                $price->logActivity(
                    logName: 'selling_prices',
                    description: "Selling prices deleted for Item ID: {$price->item_id}",
                    causer: auth()->user(),
                    properties: [
                        'item_id' => $price->item_id,
                    ],
                    event: 'deleted'
                );
            });
        });
    }
}
