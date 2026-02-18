<?php

use App\Http\Controllers\Integration\ApiKeyController;
use App\Http\Controllers\Integration\AppsController;
use App\Http\Middleware\RoleBasedAccess;
use Illuminate\Support\Facades\Route;

Route::prefix('integration')->middleware(['auth', 'verified'])->group(function () {

    // APPS
    Route::prefix('apps')->group(function () {
        Route::get('/', [AppsController::class, 'renderAppsPage'])
            ->name('apps.renderAppsPage')
            ->middleware([RoleBasedAccess::class.':project_management,read']);

        Route::post('/', [AppsController::class, 'createApp'])
            ->name('apps.createApp')
            ->middleware([RoleBasedAccess::class.':project_management,create']);

        Route::put('/{apps}', [AppsController::class, 'updateApp'])
            ->name('apps.updateApp')
            ->middleware([RoleBasedAccess::class.':project_management,update']);

        Route::delete('/{apps}', [AppsController::class, 'deleteApp'])
            ->name('apps.deleteApp')
            ->middleware([RoleBasedAccess::class.':project_management,delete']);
    });

    // API KEYS
    Route::prefix('api-keys')->group(function () {
        Route::get('/{slug}/{app}', [ApiKeyController::class, 'renderApiKeyPage'])
            ->name('apikeys.renderApiKeyPage')
            ->middleware([RoleBasedAccess::class.':api_key_management,read']);

        Route::post('/{slug}/{app}/api-keys', [ApiKeyController::class, 'createApiKey'])
            ->name('apikeys.createApiKey')
            ->middleware([RoleBasedAccess::class.':api_key_management,create']);

        Route::put('/{slug}/{app}/api-keys/{apikey}', [ApiKeyController::class, 'updateApiKey'])
            ->name('apikeys.updateApiKey')
            ->middleware([RoleBasedAccess::class.':api_key_management,update']);

        Route::delete('/{slug}/{app}/api-keys/{apikey}', [ApiKeyController::class, 'deleteApiKey'])
            ->name('apikeys.deleteApiKey')
            ->middleware([RoleBasedAccess::class.':api_key_management,delete']);
    });

});
