<?php

namespace App\Models;

use App\Events\DiscountModified;
use App\Http\Traits\HasActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

/**
 * @property int $id
 * @property string $name
 * @property string $description
 * @property string $discount_type
 * @property numeric $amount
 * @property numeric|null $min_spend
 * @property numeric|null $capped_amount
 * @property int|null $min_purchase_qty
 * @property string|null $start_date
 * @property string|null $start_time
 * @property string|null $end_date
 * @property string|null $end_time
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Items> $items
 * @property-read int|null $items_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereCappedAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereDiscountType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereEndTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereMinPurchaseQty($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereMinSpend($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereStartDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereStartTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Discount withoutTrashed()
 * @mixin \Eloquent
 */
class Discount extends Model
{
    use HasActivityLog, SoftDeletes;

    public const AMOUNT_TYPE = 'amount';

    public const PERCENTAGE_TYPE = 'percentage';

    protected $guarded = ['id'];

    protected static function booted(): void
    {
        static::created(function (Discount $discount) {
            DB::afterCommit(function () use ($discount) {
                DiscountModified::dispatch($discount, 'created');
                $discount->logActivity(
                    logName: 'discounts',
                    description: "Discount created: {$discount->name}",
                    causer: auth()->user(),
                    properties: [
                        'name' => $discount->name,
                        'discount_type' => $discount->discount_type,
                        'amount' => $discount->amount,
                    ],
                    event: 'created'
                );
            });
        });

        static::updated(function (Discount $discount) {
            $changes = $discount->getChanges();
            unset($changes['updated_at']);

            if (empty($changes)) {
                return;
            }

            DB::afterCommit(function () use ($discount, $changes) {
                DiscountModified::dispatch($discount, 'updated');
                $discount->logActivity(
                    logName: 'discounts',
                    description: "Discount updated: {$discount->name}",
                    causer: auth()->user(),
                    properties: [
                        'old' => $discount->getOriginal(),
                        'attributes' => $changes,
                    ],
                    event: 'updated'
                );
            });
        });

        static::deleted(function (Discount $discount) {
            DB::afterCommit(function () use ($discount) {
                DiscountModified::dispatch($discount, 'deleted');
                $discount->logActivity(
                    logName: 'discounts',
                    description: "Discount deleted: {$discount->name}",
                    causer: auth()->user(),
                    properties: ['name' => $discount->name],
                    event: 'deleted'
                );
            });
        });

        static::restored(function (Discount $discount) {
            DB::afterCommit(function () use ($discount) {
                DiscountModified::dispatch($discount, 'created');
                $discount->logActivity(
                    logName: 'discounts',
                    description: "Discount restored: {$discount->name}",
                    causer: auth()->user(),
                    properties: ['name' => $discount->name],
                    event: 'restored'
                );
            });
        });
    }

    public function items()
    {
        return $this->belongsToMany(Items::class, 'discount_item', 'discount_id', 'item_id');
    }
}
