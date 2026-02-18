<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserModified implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public User $user,
        public string $action
    ) {}

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('users'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'user.modified';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $this->user->loadMissing(['roles', 'assigned_stock_locations']);

        return [
            'id' => $this->user->id,
            'action' => $this->action,
            'user' => $this->action === 'deleted' ? null : $this->user->only([
                'id',
                'first_name',
                'middle_name',
                'last_name',
                'name',
                'email',
                'roles',
                'assigned_stock_locations',
                'user_signature',
                'created_at',
            ]),
        ];
    }
}
