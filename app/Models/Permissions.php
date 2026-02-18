<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Features> $app_features
 * @property-read int|null $app_features_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Features> $key_features
 * @property-read int|null $key_features_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permissions newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permissions newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permissions query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permissions whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permissions whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Permissions whereSlug($value)
 * @mixin \Eloquent
 */
class Permissions extends Model
{
    protected $guarded = ['id'];

    public $timestamps = false;

    public function app_features()
    {
        return $this->belongsToMany(Features::class, 'role_feature_permissions', 'permission_id', 'feature_id')
            ->withPivot('role_id');
    }

    public function key_features()
    {
        return $this->belongsToMany(Features::class, 'api_key_feature_permissions', 'permission_id', 'feature_id')
            ->withPivot('api_key_id');
    }
}
