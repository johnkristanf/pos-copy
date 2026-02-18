<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property array<array-key, mixed>|null $actions
 * @property array<array-key, mixed>|null $seen_by
 * @property \Illuminate\Support\Carbon|null $seen_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereActions($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereSeenAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereSeenBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Notification whereUserId($value)
 * @mixin \Eloquent
 */
class Notification extends Model
{
    protected $guarded = ['id'];

    protected $fillable = [
        'user_id',
        'actions',
        'seen_by',
        'seen_at',
    ];

    protected $casts = [
        'actions' => 'array',
        'seen_by' => 'array',
        'seen_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the notification (Actor/Trigger).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Helper to check if a specific user has seen the notification.
     */
    public function hasSeen(int $userId): bool
    {
        $seenBy = $this->seen_by ?? [];

        return \in_array($userId, $seenBy);
    }

    /**
     * Helper to mark notification as seen by a specific user.
     */
    public function markAsSeenBy(int $userId): void
    {
        $seenBy = $this->seen_by ?? [];

        if (! \in_array($userId, $seenBy)) {
            $seenBy[] = $userId;
            $this->fill([
                'seen_by' => $seenBy,
                'seen_at' => now(),
            ])->save();
        }
    }
}
