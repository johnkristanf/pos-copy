<?php

use App\Http\Controllers\Notifications\NotificationController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->prefix('notifications')->group(function () {

    Route::get('/', [NotificationController::class, 'getManyNotifications'])
        ->name('notifications.getManyNotifications');

    Route::put('/{notification}', [NotificationController::class, 'updateNotification'])
        ->name('notifications.updateNotification');
});
