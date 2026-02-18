<?php

namespace App\Events;

use App\Models\Suppliers;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SupplierModified implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Suppliers $supplier,
        public string $action
    ) {}

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('suppliers'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'supplier.modified';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $this->supplier->loadMissing(['location:id,country,region,province,municipality,barangay']);

        return [
            'id' => $this->supplier->id,
            'action' => $this->action,
            'supplier' => $this->action === 'deleted' ? null : $this->supplier,
        ];
    }
}
