<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationModified implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param  string  $action  Options: 'created', 'updated', 'deleted'
     */
    public function __construct(
        public Notification $notification,
        public string $action
    ) {}

    /**
     * Get the channels the event should broadcast on.
     * Broadcasts to a global channel for all users.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('notifications'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'notification.modified';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $this->notification->loadMissing(['user']);

        return [
            'id' => $this->notification->id,
            'action' => $this->action,
            'notification' => $this->action === 'deleted' ? null : $this->notification->toArray(),
        ];
    }
}
