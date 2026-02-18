<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $type
 * @property string|null $remarks
 * @property string $status
 * @property int $supplier_id
 * @property \App\Models\User $prepared_by
 * @property \App\Models\User|null $checked_by
 * @property \App\Models\User|null $approved_by
 * @property \App\Models\User|null $rejected_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Items> $items
 * @property-read int|null $items_count
 * @property-read \App\Models\Suppliers $supplier
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnsToSupplier newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnsToSupplier newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnsToSupplier query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnsToSupplier whereApprovedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnsToSupplier whereCheckedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnsToSupplier whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnsToSupplier whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnsToSupplier wherePreparedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnsToSupplier whereRejectedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnsToSupplier whereRemarks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnsToSupplier whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnsToSupplier whereSupplierId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnsToSupplier whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnsToSupplier whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class ReturnsToSupplier extends Model
{
    protected $guarded = ['id'];

    public function supplier()
    {
        return $this->belongsTo(Suppliers::class, 'supplier_id');
    }

    public function prepared_by()
    {
        return $this->belongsTo(User::class, 'prepared_by');
    }

    public function checked_by()
    {
        return $this->belongsTo(User::class, 'checked_by');
    }

    public function approved_by()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejected_by()
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    public function items()
    {
        return $this->belongsToMany(
            Items::class,
            'return_supplier_items',
            'returns_id',
            'item_id'
        )
            ->withPivot(['quantity', 'deduction_source_type', 'deduction_source_id'])
            ->withTimestamps();
    }
}
