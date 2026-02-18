<?php

namespace App\Models;

use App\Events\SupplierModified;
use App\Http\Traits\HasActivityLog;
use DB;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable;

/**
 * @property int $id
 * @property string $name
 * @property string|null $email
 * @property string|null $contact_person
 * @property string|null $contact_no
 * @property string|null $telefax
 * @property string|null $address
 * @property string|null $shipping
 * @property string|null $terms
 * @property int|null $location_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Items> $items
 * @property-read int|null $items_count
 * @property-read \App\Models\Locations|null $location
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ReturnsToSupplier> $returns
 * @property-read int|null $returns_count
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Suppliers newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Suppliers newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Suppliers onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Suppliers query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Suppliers whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Suppliers whereContactNo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Suppliers whereContactPerson($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Suppliers whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Suppliers whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Suppliers whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Suppliers whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Suppliers whereLocationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Suppliers whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Suppliers whereShipping($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Suppliers whereTelefax($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Suppliers whereTerms($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Suppliers whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Suppliers withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Suppliers withoutTrashed()
 *
 * @mixin \Eloquent
 */
class Suppliers extends Model
{
    use HasActivityLog, Searchable, SoftDeletes;

    protected $guarded = ['id'];

    protected static function booted(): void
    {
        static::created(function (Suppliers $supplier) {
            DB::afterCommit(function () use ($supplier) {
                SupplierModified::dispatch($supplier, 'created');
                $supplier->logActivity(
                    logName: 'suppliers',
                    description: "Supplier created: {$supplier->name}",
                    causer: auth()->user(),
                    properties: [
                        'name' => $supplier->name,
                        'email' => $supplier->email,
                        'contact_person' => $supplier->contact_person,
                    ],
                    event: 'created'
                );
            });
        });

        static::updated(function (Suppliers $supplier) {
            $changes = $supplier->getChanges();
            unset($changes['updated_at']);

            if (empty($changes)) {
                return;
            }

            DB::afterCommit(function () use ($supplier, $changes) {
                SupplierModified::dispatch($supplier, 'updated');
                $supplier->logActivity(
                    logName: 'suppliers',
                    description: "Supplier updated: {$supplier->name}",
                    causer: auth()->user(),
                    properties: [
                        'old' => $supplier->getOriginal(),
                        'attributes' => $changes,
                    ],
                    event: 'updated'
                );
            });
        });

        static::deleted(function (Suppliers $supplier) {
            DB::afterCommit(function () use ($supplier) {
                SupplierModified::dispatch($supplier, 'deleted');
                $supplier->logActivity(
                    logName: 'suppliers',
                    description: "Supplier deleted: {$supplier->name}",
                    causer: auth()->user(),
                    properties: ['name' => $supplier->name],
                    event: 'deleted'
                );
            });
        });

        static::restored(function (Suppliers $supplier) {
            DB::afterCommit(function () use ($supplier) {
                SupplierModified::dispatch($supplier, 'created');
                $supplier->logActivity(
                    logName: 'suppliers',
                    description: "Supplier restored: {$supplier->name}",
                    causer: auth()->user(),
                    properties: ['name' => $supplier->name],
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
            'contact_person' => $this->contact_person,
            'contact_no' => $this->contact_no,
            'telefax' => $this->telefax,
            'address' => $this->address,
            'shipping' => $this->shipping,
            'terms' => $this->terms,
        ];
    }

    public function items()
    {
        return $this->hasMany(Items::class, 'supplier_id');
    }

    public function returns()
    {
        return $this->hasMany(ReturnsToSupplier::class, 'supplier_id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Locations::class, 'location_id');
    }
}
