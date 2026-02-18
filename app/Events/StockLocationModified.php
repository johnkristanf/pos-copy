<?php

namespace App\Events;

use App\Models\StockLocation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StockLocationModified implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public StockLocation $stockLocation,
        public string $action
    ) {}

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('stock-locations'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'stock-location.modified';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $this->stockLocation->loadMissing('branch');

        return [
            'id' => $this->stockLocation->id,
            'action' => $this->action,
            'stock_location' => $this->action === 'deleted' ? null : $this->stockLocation,
        ];
    }
}
