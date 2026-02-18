<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $code
 * @property string $name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Features> $app_features
 * @property-read int|null $app_features_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Permissions> $app_permissions
 * @property-read int|null $app_permissions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Roles newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Roles newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Roles query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Roles whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Roles whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Roles whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Roles whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Roles whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class Roles extends Model
{
    protected $guarded = ['id'];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_roles', 'role_id', 'user_id');
    }

    public function app_features()
    {
        return $this->belongsToMany(Features::class, 'role_feature_permissions', 'role_id', 'feature_id')
            ->withPivot('permission_id');
    }

    public function app_permissions()
    {
        return $this->belongsToMany(Permissions::class, 'role_feature_permissions', 'role_id', 'permission_id')
            ->withPivot('feature_id');
    }
}
