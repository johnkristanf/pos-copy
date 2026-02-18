<?php

namespace App\Http\Traits;

use App\Models\ActivityLog;
use App\Models\KeyAuditLogs;
use Illuminate\Database\Eloquent\Model;

trait HasActivityLog
{
    public function logActivity(
        string $logName,
        string $description,
        ?Model $causer = null,
        ?array $properties = null,
        ?string $event = null
    ): ActivityLog {
        return ActivityLog::create([
            'log_name' => $logName,
            'description' => $description,
            'causer_type' => $causer?->getMorphClass(),
            'causer_id' => $causer?->getKey(),
            'properties' => $properties,
            'event' => $event,
        ]);
    }

    public function logKeyActivity($requestData, $apiKeyID)
    {
        return KeyAuditLogs::create([
            'endpoint' => $requestData['endpoint'],
            'request_method' => $requestData['request_method'],
            'api_key_id' => $apiKeyID,
        ]);
    }
}
