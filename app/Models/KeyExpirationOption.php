<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $slug
 * @property string $name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ApiKeys> $api_keys
 * @property-read int|null $api_keys_count
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KeyExpirationOption newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KeyExpirationOption newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KeyExpirationOption query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KeyExpirationOption whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KeyExpirationOption whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KeyExpirationOption whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KeyExpirationOption whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KeyExpirationOption whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class KeyExpirationOption extends Model
{
    protected $guarded = ['id'];

    public function api_keys()
    {
        return $this->hasMany(ApiKeys::class, 'key_expiration_id');
    }
}
