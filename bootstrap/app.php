<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RoleBasedAccess;
use App\Http\Middleware\SetDatabaseActivityLogVariables;
use App\Http\Middleware\VerifyApiKey;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Middleware\SetCacheHeaders;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        channels: __DIR__.'/../routes/channels.php',
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(
            append: [
                HandleInertiaRequests::class,
                AddLinkHeadersForPreloadedAssets::class,
                SetDatabaseActivityLogVariables::class,
            ],
        );
        $middleware->alias([
            'role-based-access' => RoleBasedAccess::class,
            'verify.api-key' => VerifyApiKey::class,
            'cache.headers' => SetCacheHeaders::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {

            if ($response->getStatusCode() === 403 && ! $request->expectsJson()) {
                return Inertia::render('unauthorized', [
                    'status' => 403,
                ])
                    ->toResponse($request)
                    ->setStatusCode(403);
            }

            if ($response->getStatusCode() === 419) {
                return back()->with([
                    'message' => 'The page expired, please try again.',
                ]);
            }

            return $response;
        });
    })
    ->create();
