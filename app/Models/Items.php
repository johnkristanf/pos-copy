<?php

namespace App\Models;

use App\Events\ItemModified;
use App\Http\Traits\HasActivityLog;
use DB;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable;

/**
 * @property int $id
 * @property string|null $image_url
 * @property string $sku
 * @property string $description
 * @property string|null $brand
 * @property string|null $color
 * @property string|null $size
 * @property int|null $min_quantity
 * @property int|null $max_quantity
 * @property int $category_id
 * @property int $supplier_id
 * @property int $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\BlobAttachments> $blobAttachments
 * @property-read int|null $blob_attachments_count
 * @property-read \App\Models\ItemCategory $category
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Items> $componentBlueprint
 * @property-read int|null $component_blueprint_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ItemConversionUnit> $conversion_units
 * @property-read int|null $conversion_units_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Discount> $discounts
 * @property-read int|null $discounts_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Items> $item_components
 * @property-read int|null $item_components_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\OrderItem> $order_items
 * @property-read int|null $order_items_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Items> $parentComponentBlueprint
 * @property-read int|null $parent_component_blueprint_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ItemPurchasePricesLog> $purchase_price_logs
 * @property-read int|null $purchase_price_logs_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\PurchasedItem> $purchased_items
 * @property-read int|null $purchased_items_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ReturnFromCustomer> $returned_from_customer_items
 * @property-read int|null $returned_from_customer_items_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ReturnsToSupplier> $returns_to_suppliers
 * @property-read int|null $returns_to_suppliers_count
 * @property-read \App\Models\ItemSellingPrice|null $sellingPrices
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ItemSellingPricesLog> $selling_price_logs
 * @property-read int|null $selling_price_logs_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Stock> $stocks
 * @property-read int|null $stocks_count
 * @property-read \App\Models\Suppliers $supplier
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Items newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Items newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Items onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Items query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Items whereBrand($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Items whereCategoryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Items whereColor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Items whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Items whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Items whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Items whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Items whereImageUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Items whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Items whereMaxQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Items whereMinQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Items whereSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Items whereSku($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Items whereSupplierId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Items whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Items withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Items withoutTrashed()
 * @mixin \Eloquent
 */
class Items extends Model
{
    use HasActivityLog, Searchable, SoftDeletes;

    public const SET_UNIT_TYPE = 'set';

    public const NOT_SET_UNIT_TYPE = 'not_set';

    protected $guarded = ['id'];

    protected static function booted(): void
    {
        static::created(function (Items $item) {
            DB::afterCommit(function () use ($item) {
                ItemModified::dispatch($item, 'created');
                $item->logActivity(
                    logName: 'items',
                    description: "Item created: {$item->description}",
                    causer: auth()->user(),
                    properties: [
                        'sku' => $item->sku,
                        'description' => $item->description,
                        'brand' => $item->brand,
                    ],
                    event: 'created'
                );
            });
        });

        static::updated(function (Items $item) {
            $changes = $item->getChanges();
            unset($changes['updated_at']);

            if (empty($changes)) {
                return;
            }

            DB::afterCommit(function () use ($item, $changes) {
                ItemModified::dispatch($item, 'updated');
                $item->logActivity(
                    logName: 'items',
                    description: "Item updated: {$item->sku}",
                    causer: auth()->user(),
                    properties: [
                        'old' => $item->getOriginal(),
                        'attributes' => $changes,
                    ],
                    event: 'updated'
                );
            });
        });

        static::deleted(function (Items $item) {
            DB::afterCommit(function () use ($item) {
                ItemModified::dispatch($item, 'deleted');
                $item->logActivity(
                    logName: 'items',
                    description: "Item deleted: {$item->description}",
                    causer: auth()->user(),
                    properties: ['sku' => $item->sku],
                    event: 'deleted'
                );
            });
        });

        static::restored(function (Items $item) {
            DB::afterCommit(function () use ($item) {
                ItemModified::dispatch($item, 'created');
                $item->logActivity(
                    logName: 'items',
                    description: "Item restored: {$item->description}",
                    causer: auth()->user(),
                    properties: ['sku' => $item->sku],
                    event: 'restored'
                );
            });
        });
    }

    public function toSearchableArray(): array
    {
        return [
            'id' => (int) $this->id,
            'sku' => $this->sku,
            'description' => $this->description,
            'brand' => $this->brand,
            'color' => $this->color,
            'size' => $this->size,
            'min_quantity' => $this->min_quantity,
            'max_quantity' => $this->max_quantity,
        ];
    }

    public function category()
    {
        return $this->belongsTo(ItemCategory::class, 'category_id');
    }

    public function supplier()
    {
        return $this->belongsTo(Suppliers::class, 'supplier_id');
    }

    public function stocks()
    {
        return $this->hasMany(Stock::class, 'item_id');
    }

    public function sellingPrices()
    {
        return $this->hasOne(ItemSellingPrice::class, 'item_id');
    }

    public function conversion_units()
    {
        return $this->hasMany(ItemConversionUnit::class, 'item_id');
    }

    public function discounts()
    {
        return $this->belongsToMany(Discount::class, 'discount_item', 'item_id',
            'discount_id');
    }

    public function returned_from_customer_items()
    {
        return $this->belongsToMany(
            ReturnFromCustomer::class,
            'return_from_customer_items',
            'item_id',
            'return_id'
        )
            ->withPivot('quantity', 'stock_location_id')
            ->withTimestamps();
    }

    public function returns_to_suppliers()
    {
        return $this->belongsToMany(
            ReturnsToSupplier::class,
            'return_supplier_items',
            'item_id',
            'returns_id'
        )->withPivot(['quantity', 'stock_location_id'])
            ->withTimestamps();
    }

    public function item_components()
    {
        return $this->belongsToMany(
            Items::class,
            'item_components',
            'item_id',
            'stock_id'
        )->withPivot('quantity');
    }

    // SELF-REFERENCING MANY-TO-MANY
    public function componentBlueprint()
    {
        return $this->belongsToMany(
            Items::class,
            'component_blueprint',
            'parent_item_id',
            'child_item_id'
        )->withPivot('quantity');
    }

    public function parentComponentBlueprint()
    {
        return $this->belongsToMany(
            Items::class,
            'component_blueprint',
            'child_item_id',
            'parent_item_id'
        )->withPivot('quantity');
    }

    public function order_items()
    {
        return $this->hasMany(OrderItem::class, 'item_id');
    }

    public function purchased_items()
    {
        return $this->hasMany(PurchasedItem::class, 'item_id');

    }

    public function purchase_price_logs()
    {
        return $this->hasMany(\App\Models\ItemPurchasePricesLog::class, 'item_id');
    }

    public function selling_price_logs()
    {
        return $this->hasMany(\App\Models\ItemSellingPricesLog::class, 'item_id');
    }

    public function blobAttachments()
    {
        return $this->hasMany(BlobAttachments::class, 'item_id');
    }
}
