<?php

namespace App\Observers;

use App\Http\Helpers\Logging;
use App\Models\KeyAuditLogs;
use Jenssegers\Agent\Agent;

class KeyAuditLogObserver
{
    public function creating(KeyAuditLogs $keyAuditLog): void
    {
        $agent = new Agent();

        $keyAuditLog->setAttribute('device_info', $agent->device() ?? 'Unknown');
        $keyAuditLog->setAttribute('device_type', Logging::detectDeviceType($agent));
        $keyAuditLog->setAttribute('browser', $agent->browser() ?? 'Unknown');
        $keyAuditLog->setAttribute('platform', $agent->platform() ?? 'Unknown');
        $keyAuditLog->setAttribute('ip_address', request()->ip());
    }
}
