<?php

namespace App\Http\Controllers\Integration;

use App\Data\Integration\CreateAppData;
use App\Data\Integration\GetManyAppsData;
use App\Data\Integration\UpdateAppData;
use App\Http\Controllers\Controller;
use App\Models\Apps;
use App\Services\AppsService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AppsController extends Controller
{
    public function __construct(
        protected AppsService $appsService
    ) {}

    public function renderAppsPage(GetManyAppsData $data): Response
    {
        return Inertia::render('integration/apps', [
            'apps' => $this->appsService->getManyApps($data),
            'filters' => $data->toArray(),
        ]);
    }

    public function createApp(CreateAppData $data): RedirectResponse
    {
        $this->appsService->createApp($data);

        return back()->with('success', 'App created successfully.');
    }

    public function updateApp(UpdateAppData $data, Apps $apps): RedirectResponse
    {
        $this->appsService->updateApp($apps, $data);

        return back()->with('success', 'App updated successfully.');
    }

    public function deleteApp(Apps $apps): RedirectResponse
    {
        $this->appsService->deleteApp($apps);

        return back()->with('success', 'App deleted successfully.');
    }
}
