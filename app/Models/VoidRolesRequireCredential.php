<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $void_reason_id
 * @property int $role_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Roles $role
 * @property-read \App\Models\VoidReason $void_reason
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VoidRolesRequireCredential newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VoidRolesRequireCredential newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VoidRolesRequireCredential query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VoidRolesRequireCredential whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VoidRolesRequireCredential whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VoidRolesRequireCredential whereRoleId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VoidRolesRequireCredential whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|VoidRolesRequireCredential whereVoidReasonId($value)
 * @mixin \Eloquent
 */
class VoidRolesRequireCredential extends Model
{
    protected $guarded = ['id'];

    public function void_reason()
    {
        return $this->belongsTo(VoidReason::class, 'void_reason_id');
    }

    public function role()
    {
        return $this->belongsTo(Roles::class, 'role_id');
    }
}
