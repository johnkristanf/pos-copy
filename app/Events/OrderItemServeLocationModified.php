<?php

namespace App\Events;

use App\Models\OrderItemServeLocation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderItemServeLocationModified implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $afterCommit = true;

    public function __construct(
        public OrderItemServeLocation $serveLocation,
        public string $action
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('order-item-serve-locations'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'order-item-serve-location.modified';
    }

    public function broadcastWith(): array
    {
        $this->serveLocation->loadMissing(['stock_location:id,name,tag']);

        return [
            'id' => $this->serveLocation->id,
            'order_item_id' => $this->serveLocation->order_item_id,
            'quantity_served' => $this->serveLocation->quantity_served,
            'quantity_to_serve' => $this->serveLocation->quantity_to_serve,
            'status' => $this->serveLocation->status,
            'stock_location' => $this->serveLocation->stock_location,
            'action' => $this->action,
        ];
    }
}
