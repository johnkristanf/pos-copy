<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Services\ActivityLogService;
use App\Services\UsersService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function __construct(
        private readonly ActivityLogService $activityLogService,
        private readonly UsersService $usersService
    ) {}

    public function renderActivityLogPage(Request $request): Response
    {
        $filters = $request->only([
            'search', 'search_by', 'date_from', 'date_to', 'log_name',
            'event', 'device_type', 'causer_type', 'causer_id', 'sortBy', 'sortOrder',
        ]);

        $perPage = $request->integer('limit', 10);
        $filters['limit'] = $perPage;

        return Inertia::render('settings/activity-log', [
            'activity_logs' => $this->activityLogService->getManyActivityLogs($filters, $perPage),
            'log_names' => Inertia::defer($this->activityLogService->getUniqueLogNames(...)),
            'events' => Inertia::defer($this->activityLogService->getUniqueEvents(...)),
            'device_types' => Inertia::defer($this->activityLogService->getUniqueDeviceTypes(...)),
            'users' => Inertia::defer($this->usersService->getSimpleUsersList(...)),
            'filters' => $filters,
        ]);
    }
}
