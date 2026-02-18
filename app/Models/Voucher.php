<?php

namespace App\Models;

use App\Http\Traits\HasActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

/**
 * @property int $id
 * @property string $code
 * @property string|null $description
 * @property string $type
 * @property numeric $amount
 * @property numeric|null $min_spend
 * @property numeric|null $capped_amount
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Orders> $orders
 * @property-read int|null $orders_count
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Voucher newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Voucher newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Voucher onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Voucher query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Voucher whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Voucher whereCappedAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Voucher whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Voucher whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Voucher whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Voucher whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Voucher whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Voucher whereMinSpend($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Voucher whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Voucher whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Voucher withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Voucher withoutTrashed()
 *
 * @mixin \Eloquent
 */
class Voucher extends Model
{
    use HasActivityLog, SoftDeletes;

    protected $guarded = ['id'];

    protected static function booted(): void
    {
        static::created(function (Voucher $voucher) {
            DB::afterCommit(fn () => $voucher->logActivity(
                logName: 'vouchers',
                description: "Voucher created: {$voucher->code}",
                causer: auth()->user(),
                properties: [
                    'code' => $voucher->code,
                    'amount' => $voucher->amount,
                    'type' => $voucher->type,
                ],
                event: 'created'
            ));
        });

        static::updated(function (Voucher $voucher) {
            $changes = $voucher->getChanges();
            unset($changes['updated_at']);

            if (empty($changes)) {
                return;
            }

            DB::afterCommit(fn () => $voucher->logActivity(
                logName: 'vouchers',
                description: "Voucher updated: {$voucher->code}",
                causer: auth()->user(),
                properties: [
                    'old' => $voucher->getOriginal(),
                    'attributes' => $changes,
                ],
                event: 'updated'
            ));
        });

        static::deleted(function (Voucher $voucher) {
            DB::afterCommit(fn () => $voucher->logActivity(
                logName: 'vouchers',
                description: "Voucher deleted: {$voucher->code}",
                causer: auth()->user(),
                properties: ['code' => $voucher->code],
                event: 'deleted'
            ));
        });

        static::restored(function (Voucher $voucher) {
            DB::afterCommit(fn () => $voucher->logActivity(
                logName: 'vouchers',
                description: "Voucher restored: {$voucher->code}",
                causer: auth()->user(),
                properties: ['code' => $voucher->code],
                event: 'restored'
            ));
        });
    }

    public function orders()
    {
        return $this->hasMany(Orders::class, 'used_voucher');
    }
}
