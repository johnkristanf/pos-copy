<?php

namespace App\Models;

use App\Observers\KeyAuditLogObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;

#[ObservedBy([KeyAuditLogObserver::class])]
/**
 * @property int $id
 * @property string $endpoint
 * @property string $request_method
 * @property string $ip_address
 * @property string $device_info
 * @property string $device_type
 * @property string $browser
 * @property string $platform
 * @property int $api_key_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\ApiKeys $api_keys
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KeyAuditLogs newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KeyAuditLogs newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KeyAuditLogs query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KeyAuditLogs whereApiKeyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KeyAuditLogs whereBrowser($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KeyAuditLogs whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KeyAuditLogs whereDeviceInfo($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KeyAuditLogs whereDeviceType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KeyAuditLogs whereEndpoint($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KeyAuditLogs whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KeyAuditLogs whereIpAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KeyAuditLogs wherePlatform($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KeyAuditLogs whereRequestMethod($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|KeyAuditLogs whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class KeyAuditLogs extends Model
{
    protected $guarded = ['id'];

    protected $fillable = [
        'endpoint',
        'request_method',
        'ip_address',
        'device_info',
        'device_type',
        'browser',
        'platform',
        'api_key_id',
    ];

    public function api_keys()
    {
        return $this->belongsTo(ApiKeys::class, 'api_key_id');
    }
}
