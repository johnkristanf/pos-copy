<?php

namespace App\Models;

use App\Events\PaymentModified;
use App\Http\Traits\HasActivityLog;
use DB;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property numeric $paid_amount
 * @property int $order_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Orders $order
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payments newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payments newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payments query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payments whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payments whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payments whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payments wherePaidAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Payments whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class Payments extends Model
{
    use HasActivityLog;

    public const FULLY_PAID = 'fully_paid';

    public const PARTIALLY_PAID = 'partially_paid';

    public const PENDING = 'pending';

    protected $guarded = ['id'];

    protected static function booted(): void
    {
        static::created(function (Payments $payment) {
            DB::afterCommit(function () use ($payment) {
                PaymentModified::dispatch($payment, 'created');
                $payment->logActivity(
                    logName: 'payments',
                    description: "Payment received for Order ID: {$payment->order_id}",
                    causer: auth()->user(),
                    properties: [
                        'order_id' => $payment->order_id,
                        'paid_amount' => $payment->paid_amount,
                    ],
                    event: 'created'
                );
            });
        });

        static::updated(function (Payments $payment) {
            $changes = $payment->getChanges();
            unset($changes['updated_at']);

            if (empty($changes)) {
                return;
            }

            DB::afterCommit(function () use ($payment, $changes) {
                PaymentModified::dispatch($payment, 'updated');
                $payment->logActivity(
                    logName: 'payments',
                    description: "Payment updated for Order ID: {$payment->order_id}",
                    causer: auth()->user(),
                    properties: [
                        'order_id' => $payment->order_id,
                        'old' => $payment->getOriginal(),
                        'attributes' => $changes,
                    ],
                    event: 'updated'
                );
            });
        });

        static::deleted(function (Payments $payment) {
            DB::afterCommit(function () use ($payment) {
                PaymentModified::dispatch($payment, 'deleted');
                $payment->logActivity(
                    logName: 'payments',
                    description: "Payment deleted for Order ID: {$payment->order_id}",
                    causer: auth()->user(),
                    properties: [
                        'order_id' => $payment->order_id,
                        'paid_amount' => $payment->paid_amount,
                    ],
                    event: 'deleted'
                );
            });
        });
    }

    public function order()
    {
        return $this->belongsTo(Orders::class, 'order_id');
    }
}
