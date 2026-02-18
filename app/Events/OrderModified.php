<?php

namespace App\Events;

use App\Models\Orders;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderModified implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public $afterCommit = true;

    public function __construct(
        public Orders $order,
        public string $action
    ) {}

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('orders'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'order.modified';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $this->order->loadMissing([
            'customer:id,name',
            'payment_method:id,name',
            'order_items.item:id,sku,description',
            'order_items.selected_uom:id,name,code',
        ]);

        return [
            'id' => $this->order->id,
            'action' => $this->action,
            'order' => $this->action === 'deleted' ? null : $this->order,
        ];
    }
}
