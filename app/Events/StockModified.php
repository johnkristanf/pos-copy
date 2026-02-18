<?php

namespace App\Events;

use App\Models\Stock;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StockModified implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Wait for transaction to commit before broadcasting
     */
    public $afterCommit = true;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Stock $stock,
        public string $action
    ) {}

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('stocks'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'stock.modified';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->stock->id,
            'item_id' => $this->stock->item_id,
            'location_id' => $this->stock->location_id,
            'available_quantity' => $this->stock->available_quantity,
            'action' => $this->action,
        ];
    }
}
