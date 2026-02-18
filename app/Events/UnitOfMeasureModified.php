<?php

namespace App\Events;

use App\Models\UnitOfMeasure;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UnitOfMeasureModified implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public UnitOfMeasure $unitOfMeasure,
        public string $action
    ) {}

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('unit-of-measures'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'unit-of-measure.modified';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->unitOfMeasure->id,
            'action' => $this->action,
            'unit_of_measure' => $this->action === 'deleted' ? null : $this->unitOfMeasure,
        ];
    }
}
