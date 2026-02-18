<?php

namespace App\Events;

use App\Models\PurchasedItem;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PurchasedItemModified implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public PurchasedItem $purchasedItem,
        public string $action
    ) {}

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('purchased-items'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'purchased-item.modified';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $this->purchasedItem->loadMissing([
            'purchased:id,received_at',
            'item:id,sku,description,brand,color,size,category_id,supplier_id',
            'item.category:id,code,name',
            'item.supplier:id,name',
            'item.conversion_units.purchase_uom:id,name',
            'purchase_item_uom:purchased_item_id,name',
        ]);

        return [
            'id' => $this->purchasedItem->id,
            'action' => $this->action,
            'purchased_item' => $this->action === 'deleted' ? null : $this->purchasedItem,
        ];
    }
}
