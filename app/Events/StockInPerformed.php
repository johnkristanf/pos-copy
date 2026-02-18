<?php

namespace App\Events;

use App\Models\Stock;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StockInPerformed implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Stock $stock,
        public float $quantity,
        public string $unit
    ) {}

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('stock-in'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'stock-in.performed';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $this->stock->loadMissing(['items:id,sku,description', 'location:id,name,tag']);

        return [
            'id' => $this->stock->id,
            'item' => $this->stock->items,
            'location' => $this->stock->location,
            'quantity_added' => $this->quantity,
            'unit' => $this->unit,
            'new_available_quantity' => $this->stock->available_quantity,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
