<?php

namespace App\Models;

use App\Events\CategoryModified;
use App\Http\Traits\HasActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

/**
 * @property int $id
 * @property string $code
 * @property string $name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Items> $items
 * @property-read int|null $items_count
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ItemCategory withoutTrashed()
 *
 * @mixin \Eloquent
 */
class ItemCategory extends Model
{
    use HasActivityLog, SoftDeletes;

    protected $guarded = ['id'];

    protected static function booted(): void
    {
        static::created(function (ItemCategory $category) {
            DB::afterCommit(function () use ($category) {
                CategoryModified::dispatch($category, 'created');
                $category->logActivity(
                    logName: 'categories',
                    description: "Category created: {$category->name}",
                    causer: auth()->user(),
                    properties: [
                        'code' => $category->code,
                        'name' => $category->name,
                    ],
                    event: 'created'
                );
            });
        });

        static::updated(function (ItemCategory $category) {
            $changes = $category->getChanges();
            unset($changes['updated_at']);

            if (empty($changes)) {
                return;
            }

            DB::afterCommit(function () use ($category, $changes) {
                CategoryModified::dispatch($category, 'updated');
                $category->logActivity(
                    logName: 'categories',
                    description: "Category updated: {$category->name}",
                    causer: auth()->user(),
                    properties: [
                        'old' => $category->getOriginal(),
                        'attributes' => $changes,
                    ],
                    event: 'updated'
                );
            });
        });

        static::deleted(function (ItemCategory $category) {
            DB::afterCommit(function () use ($category) {
                CategoryModified::dispatch($category, 'deleted');
                $category->logActivity(
                    logName: 'categories',
                    description: "Category deleted: {$category->name}",
                    causer: auth()->user(),
                    properties: [
                        'code' => $category->code,
                        'name' => $category->name,
                    ],
                    event: 'deleted'
                );
            });
        });

        static::restored(function (ItemCategory $category) {
            DB::afterCommit(function () use ($category) {
                CategoryModified::dispatch($category, 'created');
                $category->logActivity(
                    logName: 'categories',
                    description: "Category restored: {$category->name}",
                    causer: auth()->user(),
                    properties: [
                        'code' => $category->code,
                        'name' => $category->name,
                    ],
                    event: 'restored'
                );
            });
        });
    }

    public function items()
    {
        return $this->hasMany(Items::class, 'category_id');
    }
}
