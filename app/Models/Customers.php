<?php

namespace App\Models;

use App\Events\CustomerModified;
use App\Http\Traits\HasActivityLog;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use Laravel\Scout\Searchable;

/**
 * @property int $id
 * @property string $customer_code
 * @property string|null $customer_img
 * @property string $name
 * @property string|null $email
 * @property string|null $contact_no
 * @property bool $affiliated
 * @property bool $isactive
 * @property int|null $location_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \App\Models\CustomerCredit|null $credit
 * @property-read \App\Models\Locations|null $locations
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Orders> $orders
 * @property-read int|null $orders_count
 *
 * @method static \Database\Factories\CustomersFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customers newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customers newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customers onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customers query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customers whereAffiliated($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customers whereContactNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customers whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customers whereCustomerCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customers whereCustomerImg($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customers whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customers whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customers whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customers whereIsactive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customers whereLocationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customers whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customers whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customers withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Customers withoutTrashed()
 *
 * @mixin \Eloquent
 */
class Customers extends Model
{
    use HasActivityLog, HasFactory, Searchable, SoftDeletes;

    protected $guarded = ['id'];

    protected $fillable = [
        'customer_code',
        'customer_img',
        'name',
        'email',
        'contact_no',
        'affiliated',
        'isactive',
        'location_id',
    ];

    protected $casts = [
        'affiliated' => 'boolean',
        'isactive' => 'boolean',
        'credit_limit' => 'decimal:2',
    ];

    protected static function booted(): void
    {
        static::created(function (Customers $customer) {
            DB::afterCommit(function () use ($customer) {
                CustomerModified::dispatch($customer, 'created');
                $customer->logActivity(
                    logName: 'customers',
                    description: "Customer created: {$customer->name}",
                    causer: auth()->user(),
                    properties: [
                        'code' => $customer->customer_code,
                        'name' => $customer->name,
                        'email' => $customer->email,
                    ],
                    event: 'created'
                );
            });
        });

        static::updated(function (Customers $customer) {
            $changes = $customer->getChanges();
            unset($changes['updated_at']);

            if (empty($changes)) {
                return;
            }

            DB::afterCommit(function () use ($customer, $changes) {
                CustomerModified::dispatch($customer, 'updated');
                $customer->logActivity(
                    logName: 'customers',
                    description: "Customer updated: {$customer->name}",
                    causer: auth()->user(),
                    properties: [
                        'old' => $customer->getOriginal(),
                        'attributes' => $changes,
                    ],
                    event: 'updated'
                );
            });
        });

        static::deleted(function (Customers $customer) {
            DB::afterCommit(function () use ($customer) {
                CustomerModified::dispatch($customer, 'deleted');
                $customer->logActivity(
                    logName: 'customers',
                    description: "Customer deleted: {$customer->name}",
                    causer: auth()->user(),
                    properties: ['name' => $customer->name],
                    event: 'deleted'
                );
            });
        });

        static::restored(function (Customers $customer) {
            DB::afterCommit(function () use ($customer) {
                CustomerModified::dispatch($customer, 'created');
                $customer->logActivity(
                    logName: 'customers',
                    description: "Customer restored: {$customer->name}",
                    causer: auth()->user(),
                    properties: ['name' => $customer->name],
                    event: 'restored'
                );
            });
        });
    }

    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'customer_code' => $this->customer_code,
        ];
    }

    public function locations()
    {
        return $this->belongsTo(Locations::class, 'location_id');
    }

    public function orders()
    {
        return $this->hasMany(Orders::class, 'customer_id');
    }

    public function credit()
    {
        return $this->hasOne(CustomerCredit::class, 'customer_id');
    }
}
