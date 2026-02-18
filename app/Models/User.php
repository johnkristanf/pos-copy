<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Events\UserModified;
use App\Http\Traits\HasActivityLog as ActivityLogTrait;
use DB;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Scout\Searchable;

/**
 * @property int $id
 * @property string $first_name
 * @property string|null $middle_name
 * @property string $last_name
 * @property string $email
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property \Illuminate\Support\Carbon|null $two_factor_confirmed_at
 * @property string|null $user_signature
 * @property string|null $user_image
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\StockLocation> $assigned_stock_locations
 * @property-read int|null $assigned_stock_locations_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\BlobAttachments> $attachments
 * @property-read int|null $attachments_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ActivityLog> $causedActivities
 * @property-read int|null $caused_activities_count
 * @property-read string $name
 * @property-read mixed $user_features
 * @property-read \App\Models\BlobAttachments|null $imgAttachment
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Orders> $order_user_status
 * @property-read int|null $order_user_status_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Roles> $roles
 * @property-read int|null $roles_count
 * @property-read \App\Models\BlobAttachments|null $signatureAttachment
 *
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereFirstName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereLastName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereMiddleName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTwoFactorConfirmedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTwoFactorRecoveryCodes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTwoFactorSecret($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUserImage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUserSignature($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutTrashed()
 *
 * @mixin \Eloquent
 */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use ActivityLogTrait, HasFactory, Notifiable, Searchable, SoftDeletes, TwoFactorAuthenticatable;

    protected $guarded = [
        'id',
    ];

    protected $appends = ['user_features', 'name'];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function toSearchableArray(): array
    {
        return [
            'id' => (int) $this->id,
            'first_name' => $this->first_name,
            'middle_name' => $this->middle_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
        ];
    }

    public function getNameAttribute(): string
    {
        return (string) $this->getAttribute('first_name').' '.(string) $this->getAttribute('last_name');
    }

    protected static function boot()
    {
        parent::boot();

        static::created(function (User $user) {
            DB::afterCommit(function () use ($user) {
                $user->logActivity(
                    logName: 'user',
                    description: "User account created: {$user->name}",
                    causer: auth()->user() ?? $user,
                    properties: [
                        'email' => $user->email,
                        'name' => $user->name,
                    ],
                    event: 'created'
                );

                UserModified::dispatch($user, 'created');
            });
        });

        static::updated(function (User $user) {
            $changes = $user->getChanges();

            if (empty($changes) || \count($changes) === 1 && isset($changes['updated_at'])) {
                return;
            }

            $excludedFields = ['updated_at', 'password', 'remember_token', 'two_factor_secret', 'two_factor_recovery_codes'];
            $changes = array_diff_key($changes, array_flip($excludedFields));

            if (! empty($changes)) {
                DB::afterCommit(function () use ($user, $changes) {
                    $user->logActivity(
                        logName: 'user',
                        description: "User account updated: {$user->name}",
                        causer: auth()->user() ?? $user,
                        properties: [
                            'old' => array_intersect_key($user->getOriginal(), $changes),
                            'new' => $changes,
                        ],
                        event: 'updated'
                    );

                    UserModified::dispatch($user, 'updated');
                });
            }
        });

        static::deleted(function (User $user) {
            DB::afterCommit(function () use ($user) {
                $user->logActivity(
                    logName: 'user',
                    description: "User account deleted: {$user->name}",
                    causer: auth()->user() ?? $user,
                    properties: [
                        'email' => $user->email,
                        'name' => $user->name,
                    ],
                    event: 'deleted'
                );

                UserModified::dispatch($user, 'deleted');
            });
        });
    }

    // ------------------------------------------- USER ATTRIBUTES --------------------------------------------------

    public function getUserFeaturesAttribute()
    {
        $featuresWithPermissions = DB::table('features')
            ->join('role_feature_permissions', 'features.id', '=', 'role_feature_permissions.feature_id')
            ->join('permissions', 'role_feature_permissions.permission_id', '=', 'permissions.id')
            ->join('user_roles', 'role_feature_permissions.role_id', '=', 'user_roles.role_id')
            ->where('user_roles.user_id', $this->id)
            ->select(
                'features.id',
                'features.tag',
                'features.name',
                'permissions.name as permission_name'
            )
            ->distinct()
            ->get()
            ->groupBy('id');

        return $featuresWithPermissions->map(function ($group) {
            $first = $group->first();

            return [
                'id' => $first->id,
                'tag' => $first->tag,
                'name' => $first->name,
                'permissions' => $group->pluck('permission_name')->unique()->values()->toArray(),
            ];
        })->values();
    }

    // ------------------------------------------- RELATIONED TABLES --------------------------------------------------
    public function assigned_stock_locations()
    {
        return $this->belongsToMany(StockLocation::class, 'user_locations', 'user_id', 'stock_location_id')
            ->withTimestamps();
    }

    public function roles()
    {
        return $this->belongsToMany(Roles::class, 'user_roles', 'user_id', 'role_id');
    }

    public function order_user_status()
    {
        return $this->belongsToMany(Orders::class, 'order_user_status', 'user_id', 'order_id')
            ->withPivot('status');
    }

    public function causedActivities()
    {
        return $this->morphMany(ActivityLog::class, 'causer');
    }

    public function signatureAttachment()
    {
        return $this->hasOne(BlobAttachments::class, 'user_id')
            ->where(function ($query) {
                $query->whereColumn('file_url', 'users.user_signature');
            })
            ->orWhere(function ($query) {
                $query->whereRaw('file_url = users.user_signature');
            });
    }

    public function imgAttachment()
    {
        return $this->hasOne(BlobAttachments::class, 'user_id')
            ->where(function ($query) {
                $query->whereColumn('file_url', 'users.user_image');
            })
            ->orWhere(function ($query) {
                $query->whereRaw('file_url = users.user_image');
            });
    }

    public function attachments()
    {
        return $this->hasMany(BlobAttachments::class, 'user_id');
    }
}
