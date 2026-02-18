<?php

namespace App\Events;

use App\Models\Discount;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DiscountModified implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Discount $discount,
        public string $action
    ) {}

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('discounts'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'discount.modified';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $this->discount->loadCount('items');

        return [
            'id' => $this->discount->id,
            'action' => $this->action,
            'discount' => $this->action === 'deleted' ? null : $this->discount,
        ];
    }
}
