<?php

namespace App\Http\Middleware;

use App\Http\Helpers\ApiResponse;
use App\Jobs\KeyActivityLog;
use App\Models\ApiKeys;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyApiKey
{
    public function handle(Request $request, Closure $next, string $featureTag, string $permissionName): Response
    {
        $apiKey = $request->header('X-API-KEY');

        if (empty($apiKey)) {
            return ApiResponse::Unauthorized('API Key Not Provided');
        }

        $apiKeyRecord = ApiKeys::query()->where('key', $apiKey)->first();

        if (empty($apiKeyRecord)) {
            return ApiResponse::Unauthorized('API Key Not Found');
        }

        if (! $apiKeyRecord->isInbound()) {
            return ApiResponse::Unauthorized('Invalid API Key Type');
        }

        if (! $apiKeyRecord->isActive()) {
            return ApiResponse::Unauthorized('API Key Inactive');
        }

        if ($apiKeyRecord->isExpired()) {
            return ApiResponse::Unauthorized('API Key Has Expired');
        }

        if (! $apiKeyRecord->hasValidFeaturePermission($featureTag, $permissionName)) {
            $featureName = config("features.$featureTag.name") ?? $featureTag;
            $permissionLabel = config("permissions.$permissionName") ?? $permissionName;

            return ApiResponse::Forbidden(
                "API Key does not have permission '$permissionLabel' on feature '$featureName'."
            );
        }

        $requestData = [
            'endpoint' => $request->path(),
            'request_method' => $request->method(),
            'ip_address' => $request->ip(),
        ];

        KeyActivityLog::dispatch($requestData, $apiKeyRecord->getAttribute('id'));

        return $next($request);
    }
}
