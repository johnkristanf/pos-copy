<?php

namespace App\Events;

use App\Models\Payments;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PaymentModified implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $afterCommit = true;

    public function __construct(
        public Payments $payment,
        public string $action
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('payments'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'payment.modified';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->payment->id,
            'order_id' => $this->payment->order_id,
            'paid_amount' => $this->payment->paid_amount,
            'action' => $this->action,
            'created_at' => $this->payment->created_at,
        ];
    }
}
