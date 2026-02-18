<?php

namespace App\Events;

use App\Models\Items;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ItemModified implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Items $item,
        public string $action
    ) {}

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('items'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'item.modified';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $this->item->loadMissing([
            'category:id,name',
            'supplier:id,name',
            'sellingPrices',
            'conversion_units.purchase_uom:id,name,code',
            'stocks.location:id,name',
            'blobAttachments:id,item_id,file_url',
        ]);

        return [
            'id' => $this->item->id,
            'action' => $this->action,
            'item' => $this->action === 'deleted' ? null : $this->item,
        ];
    }
}
