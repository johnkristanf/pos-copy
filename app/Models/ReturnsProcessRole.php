<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $role_id
 * @property int $feature_id
 * @property string $type
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Roles $role
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnsProcessRole newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnsProcessRole newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnsProcessRole query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnsProcessRole whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnsProcessRole whereFeatureId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnsProcessRole whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnsProcessRole whereRoleId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnsProcessRole whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReturnsProcessRole whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class ReturnsProcessRole extends Model
{
    public const CHECKER = 'checker';

    public const APPROVER = 'approver';

    protected $guarded = ['id'];

    public function role()
    {
        return $this->belongsTo(Roles::class, 'role_id');
    }
}
