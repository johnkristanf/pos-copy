<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

/**
 * @property int $id
 * @property string $invoice_number
 * @property string $invoice_issued_date
 * @property string $reason
 * @property int $customer_id
 * @property int|null $prepared_by
 * @property int|null $check_by
 * @property int|null $approved_by
 * @property int|null $rejected_by
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User|null $approver
 * @property-read \App\Models\User|null $checker
 * @property-read \App\Models\Customers $customer
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Items> $items
 * @property-read int|null $items_count
 * @property-read \App\Models\User|null $preparer
 * @property-read \App\Models\User|null $rejecter
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnFromCustomer newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnFromCustomer newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnFromCustomer query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnFromCustomer whereApprovedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnFromCustomer whereCheckBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnFromCustomer whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnFromCustomer whereCustomerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnFromCustomer whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnFromCustomer whereInvoiceIssuedDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnFromCustomer whereInvoiceNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnFromCustomer wherePreparedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnFromCustomer whereReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnFromCustomer whereRejectedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnFromCustomer whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnFromCustomer whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class ReturnFromCustomer extends Model
{
    use Searchable;

    protected $guarded = ['id'];

    public function customer()
    {
        return $this->belongsTo(Customers::class, 'customer_id');
    }

    public function preparer()
    {
        return $this->belongsTo(User::class, 'prepared_by');
    }

    public function checker()
    {
        return $this->belongsTo(User::class, 'check_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejecter()
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    public function items()
    {
        return $this->belongsToMany(Items::class, 'return_from_customer_items', 'return_id', 'item_id')
            ->withPivot('quantity', 'stock_location_id')
            ->withTimestamps();
    }
}
