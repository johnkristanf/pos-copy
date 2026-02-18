<?php

namespace App\Models;

use App\Http\Traits\HasActivityLog as ActivityLogTrait;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Laravel\Scout\Searchable;

/**
 * @property int $id
 * @property string $type inbound, outbound
 * @property string $label
 * @property string $key
 * @property bool $isactive
 * @property string $app_id
 * @property int $key_expiration_id
 * @property \Illuminate\Support\Carbon|null $last_used_at
 * @property \Illuminate\Support\Carbon|null $last_rolled_at
 * @property \Illuminate\Support\Carbon|null $expires_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Apps|null $app
 * @property-read Collection<int, \App\Models\KeyAuditLogs> $audit_logs
 * @property-read int|null $audit_logs_count
 * @property-read Collection<int, \App\Models\Features> $features
 * @property-read int|null $features_count
 * @property-read \App\Models\KeyExpirationOption $key_expiration
 * @property-read Collection<int, \App\Models\Permissions> $permissions
 * @property-read int|null $permissions_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ApiKeys newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ApiKeys newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ApiKeys query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ApiKeys whereAppId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ApiKeys whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ApiKeys whereExpiresAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ApiKeys whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ApiKeys whereIsactive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ApiKeys whereKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ApiKeys whereKeyExpirationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ApiKeys whereLabel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ApiKeys whereLastRolledAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ApiKeys whereLastUsedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ApiKeys whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ApiKeys whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class ApiKeys extends Model
{
    use ActivityLogTrait, Searchable;

    protected $guarded = ['id'];

    protected $casts = [
        'isactive' => 'boolean',
        'app_id' => 'string',
        'key_expiration_id' => 'integer',
        'last_used_at' => 'datetime',
        'last_rolled_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::created(function (ApiKeys $apiKey) {
            DB::afterCommit(fn () => $apiKey->logActivity(
                logName: 'api_key',
                description: "API key created: {$apiKey->label}",
                causer: auth()->user() ?? $apiKey,
                properties: [
                    'label' => $apiKey->label,
                    'app_id' => $apiKey->app_id,
                ],
                event: 'created'
            ));
        });

        static::updated(function (ApiKeys $apiKey) {
            $changes = $apiKey->getChanges();
            unset($changes['updated_at']);

            if (empty($changes)) {
                return;
            }

            DB::afterCommit(fn () => $apiKey->logActivity(
                logName: 'api_key',
                description: "API key updated: {$apiKey->label}",
                causer: auth()->user() ?? $apiKey,
                properties: [
                    'label' => $apiKey->label,
                    'changes' => $changes,
                ],
                event: 'updated'
            ));
        });

        static::deleted(function (ApiKeys $apiKey) {
            DB::afterCommit(fn () => $apiKey->logActivity(
                logName: 'api_key',
                description: "API key deleted: {$apiKey->label}",
                causer: auth()->user() ?? $apiKey,
                properties: [
                    'label' => $apiKey->label,
                    'app_id' => $apiKey->app_id,
                ],
                event: 'deleted'
            ));
        });
    }

    // ------------------------------------------- MODEL METHODS --------------------------------------------------
    public function toSearchableArray(): array
    {
        return [
            'id' => (int) $this->id,
            'label' => $this->label,
            'key' => $this->key,
            'app_id' => $this->app_id,
            'type' => $this->type,
        ];
    }

    public function isExpired(): bool
    {
        return $this->expires_at && now()->isAfter($this->expires_at);
    }

    public function isActive(): bool
    {
        return $this->isactive;
    }

    public function isInbound(): bool
    {
        return $this->type === 'inbound';
    }

    public function isOutbound(): bool
    {
        return $this->type === 'outbound';
    }

    public function hasValidFeaturePermission(string $featureTag, string $permissionName): bool
    {
        return $this->features()
            ->where('features.tag', $featureTag)
            ->whereHas('key_permissions', function ($query) use ($permissionName) {
                $query->where('permissions.name', $permissionName);
            })
            ->exists();
    }

    // ------------------------------------------- RELATIONED TABLES --------------------------------------------------

    /**
     * Get the project that owns the API key.
     */
    public function app()
    {
        return $this->belongsTo(Apps::class, 'app_id');
    }

    /**
     * Get the key expiration option.
     */
    public function key_expiration()
    {
        return $this->belongsTo(KeyExpirationOption::class, 'key_expiration_id');
    }

    /**
     * Get all audit logs for this API key.
     */
    public function audit_logs()
    {
        return $this->hasMany(KeyAuditLogs::class, 'api_key_id');
    }

    /**
     * Get features associated with this API key.
     */
    public function features()
    {
        return $this->belongsToMany(Features::class, 'api_key_feature_permissions', 'api_key_id', 'feature_id')
            ->withPivot('permission_id');
    }

    /**
     * Get permissions associated with this API key.
     */
    public function permissions()
    {
        return $this->belongsToMany(Permissions::class, 'api_key_feature_permissions', 'api_key_id', 'permission_id')
            ->withPivot('feature_id');
    }

    /**
     * Get features with their permissions for this API key.
     */
    public function featuresWithPermissions()
    {
        return $this->features()
            ->with(['permissions' => function ($query) {
                $query->wherePivot('api_key_id', $this->getKey());
            }]);
    }
}
