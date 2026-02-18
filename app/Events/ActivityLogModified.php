<?php

namespace App\Events;

use App\Models\ActivityLog;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ActivityLogModified implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public ActivityLog $activityLog,
        public string $action
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('activity-logs'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'activity-log.modified';
    }

    public function broadcastWith(): array
    {
        try {
            $freshLog = ActivityLog::with(['causer:id,first_name,middle_name,last_name,email'])
                ->find($this->activityLog->id);

            if (! $freshLog && $this->action !== 'deleted') {
                Log::warning("ActivityLog {$this->activityLog->id} not found for broadcast");

                return [
                    'id' => $this->activityLog->id,
                    'action' => $this->action,
                    'activity_log' => null,
                ];
            }

            return [
                'id' => $this->activityLog->id,
                'action' => $this->action,
                'activity_log' => $this->action === 'deleted' ? null : $this->transformActivityLog($freshLog),
                'timestamp' => now()->toIso8601String(),
            ];
        } catch (\Exception $e) {
            Log::error('Failed to broadcast ActivityLog: '.$e->getMessage());

            return [
                'id' => $this->activityLog->id,
                'action' => $this->action,
                'activity_log' => null,
                'error' => true,
            ];
        }
    }

    protected function transformActivityLog(?ActivityLog $activityLog): ?array
    {
        if (! $activityLog) {
            return null;
        }

        $causer = $activityLog->causer;
        $fullName = null;

        if ($causer) {
            $fullName = trim(sprintf(
                '%s %s %s',
                $causer->getAttribute('first_name') ?? '',
                $causer->getAttribute('middle_name') ?? '',
                $causer->getAttribute('last_name') ?? ''
            ));

            if (empty($fullName)) {
                $fullName = $causer->getAttribute('email') ?? 'N/A';
            }
        }

        return [
            'id' => $activityLog->getAttribute('id'),
            'log_name' => $activityLog->getAttribute('log_name'),
            'description' => $activityLog->getAttribute('description'),
            'event' => $activityLog->getAttribute('event'),
            'properties' => $activityLog->getAttribute('properties'),
            'device_info' => $activityLog->getAttribute('device_info'),
            'device_type' => $activityLog->getAttribute('device_type'),
            'browser' => $activityLog->getAttribute('browser'),
            'platform' => $activityLog->getAttribute('platform'),
            'ip_address' => $activityLog->getAttribute('ip_address'),
            'created_at' => $activityLog->getAttribute('created_at')?->toDateTimeString(),
            'causer' => $causer ? [
                'id' => $causer->getKey(),
                'type' => $causer->getMorphClass(),
                'name' => $fullName,
            ] : null,
        ];
    }
}
