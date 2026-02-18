<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $quantity
 * @property string $action
 * @property string $status
 * @property int $item_id
 * @property int $location_id
 * @property int|null $prepared_by
 * @property int|null $checked_by
 * @property int|null $approved_by
 * @property int|null $rejected_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User|null $approver
 * @property-read \App\Models\User|null $checker
 * @property-read \App\Models\Items $item
 * @property-read \App\Models\User|null $preparer
 * @property-read \App\Models\User|null $rejecter
 * @property-read \App\Models\StockLocation $stockLocation
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereAction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereApprovedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereCheckedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereLocationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment wherePreparedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereRejectedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StockAdjustment whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class StockAdjustment extends Model
{
    protected $guarded = ['id'];

    // ------------------------------------------- RELATIONED TABLES --------------------------------------------------

    public function item()
    {
        return $this->belongsTo(Items::class, 'item_id');
    }

    public function stockLocation()
    {
        return $this->belongsTo(StockLocation::class, 'location_id');
    }

    /**
     * Get the user who prepared the adjustment.
     */
    public function preparer()
    {
        return $this->belongsTo(User::class, 'prepared_by');
    }

    /**
     * Get the user who checked the adjustment.
     */
    public function checker()
    {
        return $this->belongsTo(User::class, 'checked_by');
    }

    /**
     * Get the user who approved the adjustment.
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the user who rejected the adjustment.
     */
    public function rejecter()
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }
}
