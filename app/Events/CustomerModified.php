<?php

namespace App\Events;

use App\Models\Customers;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CustomerModified implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Wait for the transaction to commit before broadcasting
     * to prevent race conditions where frontend reloads before data is saved.
     */
    public $afterCommit = true;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Customers $customer,
        public string $action
    ) {}

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('customers'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'customer.modified';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $this->customer->loadMissing(['locations:id,country,region,province,municipality,barangay']);

        return [
            'id' => $this->customer->id,
            'action' => $this->action,
            'customer' => $this->action === 'deleted' ? null : $this->customer,
        ];
    }
}
