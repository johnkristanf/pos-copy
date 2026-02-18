<?php

namespace App\Models;

use App\Http\Traits\HasActivityLog as ActivityLogTrait;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use Laravel\Scout\Searchable;

/**
 * @property string $id
 * @property string $slug
 * @property string $name
 * @property int $isactive
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ApiKeys> $api_keys
 * @property-read int|null $api_keys_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Apps newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Apps newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Apps onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Apps query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Apps whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Apps whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Apps whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Apps whereIsactive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Apps whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Apps whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Apps whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Apps withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Apps withoutTrashed()
 * @mixin \Eloquent
 */
class Apps extends Model
{
    use ActivityLogTrait, HasUuids, Searchable, SoftDeletes;

    protected $guarded = ['id'];

    protected $cast = [
        'isactive' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::created(function (Apps $app) {
            DB::afterCommit(fn () => $app->logActivity(
                logName: 'apps',
                description: "App created: {$app->name}",
                causer: auth()->user(),
                properties: [
                    'name' => $app->name,
                    'slug' => $app->slug,
                    'isactive' => $app->isactive,
                ],
                event: 'created'
            ));
        });

        static::updated(function (Apps $app) {
            $changes = $app->getChanges();
            unset($changes['updated_at']);

            if (empty($changes) || \array_key_exists('deleted_at', $changes)) {
                return;
            }

            DB::afterCommit(fn () => $app->logActivity(
                logName: 'apps',
                description: "App updated: {$app->name}",
                causer: auth()->user(),
                properties: [
                    'name' => $app->name,
                    'changes' => $changes,
                ],
                event: 'updated'
            ));
        });

        static::deleted(function (Apps $app) {
            DB::afterCommit(fn () => $app->logActivity(
                logName: 'apps',
                description: "App deleted: {$app->name}",
                causer: auth()->user(),
                properties: ['name' => $app->name],
                event: 'deleted'
            ));
        });

        static::restored(function (Apps $app) {
            DB::afterCommit(fn () => $app->logActivity(
                logName: 'apps',
                description: "App restored: {$app->name}",
                causer: auth()->user(),
                properties: ['name' => $app->name],
                event: 'restored'
            ));
        });

        static::forceDeleted(function (Apps $app) {
            DB::afterCommit(fn () => $app->logActivity(
                logName: 'apps',
                description: "App permanently deleted: {$app->name}",
                causer: auth()->user(),
                properties: ['name' => $app->name],
                event: 'forceDeleted'
            ));
        });
    }

    public function api_keys()
    {
        return $this->hasMany(ApiKeys::class, 'app_id');
    }
}
