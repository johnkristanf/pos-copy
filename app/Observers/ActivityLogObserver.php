<?php

namespace App\Observers;

use App\Events\ActivityLogModified;
use App\Http\Helpers\Logging;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\DB;
use Jenssegers\Agent\Agent;

class ActivityLogObserver
{
    public function creating(ActivityLog $activityLog): void
    {
        $agent = new Agent();

        $activityLog->setAttribute('device_info', $agent->device() ?? 'Unknown');
        $activityLog->setAttribute('device_type', Logging::detectDeviceType($agent));
        $activityLog->setAttribute('browser', Logging::getBrowserInfo($agent));
        $activityLog->setAttribute('platform', Logging::getPlatformInfo($agent));
        $activityLog->setAttribute('ip_address', request()->ip());
        $activityLog->setAttribute('user_agent', request()->userAgent());
    }

    public function created(ActivityLog $activityLog): void
    {
        $this->dispatchAfterCommit($activityLog, 'created');
    }

    public function updated(ActivityLog $activityLog): void
    {
        $this->dispatchAfterCommit($activityLog, 'updated');
    }

    public function deleted(ActivityLog $activityLog): void
    {
        $this->dispatchAfterCommit($activityLog, 'deleted');
    }

    protected function dispatchAfterCommit(ActivityLog $activityLog, string $action): void
    {
        DB::afterCommit(function () use ($activityLog, $action) {
            ActivityLogModified::dispatch($activityLog, $action);
        });
    }
}
