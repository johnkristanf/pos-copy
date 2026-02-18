<?php

namespace App\Models;

use App\Events\OrderModified;
use App\Http\Traits\HasActivityLog as ActivityLogTrait;
use DB;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable;

/**
 * @property int $id
 * @property string|null $po_number
 * @property string|null $invoice_number
 * @property numeric $total_payable
 * @property string|null $payment_status
 * @property int|null $void_reason_id
 * @property bool $is_draft
 * @property bool $is_void
 * @property int $payment_method_id
 * @property int $customer_id
 * @property int|null $used_voucher
 * @property numeric|null $vouchers_used
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property int|null $user_id
 * @property-read \App\Models\OrderCredits|null $credits
 * @property-read \App\Models\Customers $customer
 * @property-read string $order_number
 * @property-read string $status
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\OrderItem> $order_items
 * @property-read int|null $order_items_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $order_user_status
 * @property-read int|null $order_user_status_count
 * @property-read \App\Models\PaymentMethods $payment_method
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Payments> $payments
 * @property-read int|null $payments_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\OrderTax> $tax
 * @property-read int|null $tax_count
 * @property-read \App\Models\User|null $user
 * @property-read \App\Models\VoidReason|null $void_reason
 * @property-read \App\Models\Voucher|null $voucher
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Orders newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Orders newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Orders onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Orders query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Orders whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Orders whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Orders whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Orders whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Orders whereInvoiceNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Orders whereIsDraft($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Orders whereIsVoid($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Orders wherePaymentMethodId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Orders wherePaymentStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Orders wherePoNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Orders whereTotalPayable($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Orders whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Orders whereUsedVoucher($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Orders whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Orders whereVoidReasonId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Orders whereVouchersUsed($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Orders withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Orders withoutTrashed()
 *
 * @mixin \Eloquent
 */
class Orders extends Model
{
    use ActivityLogTrait, Searchable, SoftDeletes;

    public const ACTIVE = 'active';

    public const COMPLETED = 'completed';

    public const CANCELLED = 'cancelled';

    protected $guarded = ['id'];

    protected $casts = [
        'created_at' => 'datetime',
        'total_payable' => 'decimal:2',
        'is_draft' => 'boolean',
        'is_void' => 'boolean',
    ];

    protected $appends = ['order_number', 'status'];

    protected static function booted(): void
    {
        static::created(function (Orders $order) {
            DB::afterCommit(function () use ($order) {
                OrderModified::dispatch($order, 'created');

                $description = $order->is_draft
                ? "Draft order created: {$order->order_number}"
                : "Order created: {$order->order_number}";

                $order->logActivity(
                    logName: 'orders',
                    description: $description,
                    causer: auth()->user(),
                    properties: [
                        'order_number' => $order->order_number,
                        'total_payable' => $order->total_payable,
                        'customer_id' => $order->customer_id,
                        'is_draft' => $order->is_draft,
                    ],
                    event: 'created'
                );
            });
        });

        static::updated(function (Orders $order) {
            $changes = $order->getChanges();
            unset($changes['updated_at']);

            if (empty($changes)) {
                return;
            }

            DB::afterCommit(function () use ($order, $changes) {
                OrderModified::dispatch($order, 'updated');

                $description = $order->is_draft
                ? "Draft order updated: {$order->order_number}"
                : "Order updated: {$order->order_number}";

                $order->logActivity(
                    logName: 'orders',
                    description: $description,
                    causer: auth()->user(),
                    properties: [
                        'old' => $order->getOriginal(),
                        'attributes' => $changes,
                    ],
                    event: 'updated'
                );
            });
        });

        static::deleted(function (Orders $order) {
            DB::afterCommit(function () use ($order) {
                OrderModified::dispatch($order, 'deleted');

                $description = $order->is_draft
                ? "Draft order deleted: {$order->order_number}"
                : "Order deleted: {$order->order_number}";

                $order->logActivity(
                    logName: 'orders',
                    description: $description,
                    causer: auth()->user(),
                    properties: ['order_number' => $order->order_number],
                    event: 'deleted'
                );
            });
        });

        static::restored(function (Orders $order) {
            DB::afterCommit(function () use ($order) {
                OrderModified::dispatch($order, 'created');

                $description = $order->is_draft
                ? "Draft order restored: {$order->order_number}"
                : "Order restored: {$order->order_number}";

                $order->logActivity(
                    logName: 'orders',
                    description: $description,
                    causer: auth()->user(),
                    properties: ['order_number' => $order->order_number],
                    event: 'restored'
                );
            });
        });
    }

    public function getOrderNumberAttribute(): string
    {
        return 'ORD-'.str_pad((string) $this->id, 5, '0', STR_PAD_LEFT);
    }

    public function getStatusAttribute(): string
    {
        if ($this->is_void) {
            return 'void';
        }

        if ($this->is_draft) {
            return 'draft';
        }

        if ($this->payment_status === 'fully_paid') {
            return 'paid';
        }

        return $this->payment_status ?? 'pending';
    }

    public function order_items()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    public function payment_method()
    {
        return $this->belongsTo(PaymentMethods::class, 'payment_method_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customers::class, 'customer_id');
    }

    public function order_user_status()
    {
        return $this->belongsToMany(User::class, 'order_user_status', 'order_id', 'user_id')
            ->withPivot('status');
    }

    public function payments()
    {
        return $this->hasMany(Payments::class, 'order_id');
    }

    public function tax()
    {
        return $this->hasMany(OrderTax::class, 'order_id');
    }

    public function credits()
    {
        return $this->hasOne(OrderCredits::class, 'order_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function voucher()
    {
        return $this->belongsTo(Voucher::class, 'used_voucher');
    }

    public function void_reason()
    {
        return $this->belongsTo(VoidReason::class, 'void_reason_id');
    }

    public function toSearchableArray(): array
    {
        $array = [
            'id' => (int) $this->id,
            'invoice_number' => $this->invoice_number,
            'total_payable' => (float) $this->total_payable,
        ];

        if (config('scout.driver') !== 'database') {
            $array['customer_name'] = $this->customer?->name;
            $array['order_items'] = $this->order_items->map(fn ($item) => $item->item?->description)->toArray();
            $array['payment_method_id'] = $this->payment_method_id;
            $array['customer_id'] = (int) $this->customer_id;
        }

        return $array;
    }
}
