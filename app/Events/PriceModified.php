<?php

namespace App\Events;

use App\Models\ItemSellingPrice;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PriceModified implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public ItemSellingPrice $price,
        public string $action
    ) {}

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('prices'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'price.modified';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $this->price->loadMissing(['item:id,sku,description,image_url']);

        return [
            'id' => $this->price->id,
            'item_id' => $this->price->item_id,
            'action' => $this->action,
            'price' => $this->action === 'deleted' ? null : $this->price,
        ];
    }
}
