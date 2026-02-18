<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property string $void_reason
 * @property bool $require_password
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\VoidRolesRequireCredential> $roles_require_credentials
 * @property-read int|null $roles_require_credentials_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VoidReason newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VoidReason newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VoidReason onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VoidReason query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VoidReason whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VoidReason whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VoidReason whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VoidReason whereRequirePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VoidReason whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VoidReason whereVoidReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VoidReason withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VoidReason withoutTrashed()
 * @mixin \Eloquent
 */
class VoidReason extends Model
{
    use SoftDeletes;

    protected $guarded = ['id'];

    protected $casts = [
        'require_password' => 'boolean',
    ];

    public function roles_require_credentials()
    {
        return $this->hasMany(VoidRolesRequireCredential::class, 'void_reason_id');
    }
}
