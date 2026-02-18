<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Laravel\Scout\Searchable;

/**
 * @property int $id
 * @property string $tag
 * @property string $name
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Permissions> $app_permissions
 * @property-read int|null $app_permissions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Permissions> $key_permissions
 * @property-read int|null $key_permissions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Permissions> $permissions
 * @property-read int|null $permissions_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Features newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Features newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Features query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Features whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Features whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Features whereTag($value)
 * @mixin \Eloquent
 */
class Features extends Model
{
    use Searchable;

    protected $guarded = ['id'];

    public $timestamps = false;

    public function toSearchableArray(): array
    {
        return [
            'id' => (int) $this->id,
            'tag' => $this->tag,
            'name' => $this->name,
        ];
    }

    /**
     * Get permissions for application roles
     */
    public function app_permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permissions::class, 'role_feature_permissions', 'feature_id', 'permission_id')
            ->withPivot('role_id');
    }

    /**
     * Get permissions for API keys
     */
    public function key_permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permissions::class, 'api_key_feature_permissions', 'feature_id', 'permission_id')
            ->withPivot('api_key_id');
    }

    /**
     * Get all available permissions for this feature
     * This is the base permissions that can be assigned
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permissions::class, 'feature_permissions', 'feature_id', 'permission_id');
    }
}
