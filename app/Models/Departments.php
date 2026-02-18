<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Departments newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Departments newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Departments query()
 *
 * @mixin \Eloquent
 */
class Departments extends Model
{
    protected $guarded = ['id'];

    public function users()
    {
        return $this->hasMany(User::class, 'department_id');
    }
}
