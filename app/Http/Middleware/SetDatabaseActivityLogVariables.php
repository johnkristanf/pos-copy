<?php

namespace App\Http\Middleware;

use App\Services\ActivityLogService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetDatabaseActivityLogVariables
{
    public function __construct(protected ActivityLogService $activityLogService) {}

    public function handle(Request $request, Closure $next): Response
    {
        $this->activityLogService->setDatabaseSessionVariables();

        $response = $next($request);

        $this->activityLogService->clearDatabaseSessionVariables();

        return $response;
    }
}
