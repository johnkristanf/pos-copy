<?php

use App\Http\Controllers\Settings\ActivityLogController;
use App\Http\Controllers\Settings\UsersController;
use App\Http\Middleware\RoleBasedAccess;
use Illuminate\Support\Facades\Route;

Route::prefix('settings')->middleware(['auth', 'verified'])->group(function () {

    // USERS GROUP
    Route::prefix('users')->group(function () {

        // ME (Profile) - Open to all authenticated users
        Route::get('me', [UsersController::class, 'renderMePage'])
            ->name('settings.users.me.renderMePage');

        // USERS LIST
        Route::get('/', [UsersController::class, 'renderUsersPage'])
            ->name('settings.users.renderUsersPage')
            ->middleware([RoleBasedAccess::class.':user_management,read']);

        // REGISTER USER
        Route::post('/', [UsersController::class, 'registerUser'])
            ->name('settings.users.registerUser')
            ->middleware([RoleBasedAccess::class.':user_management,create']);

        // SPECIFIC USER ROUTES
        Route::prefix('{user}')->group(function () {
            // View User Details
            Route::get('/', [UsersController::class, 'renderUserPage'])
                ->name('settings.users.user.renderUserPage')
                ->middleware([RoleBasedAccess::class.':user_management,read']);

            // Update User
            Route::put('/', [UsersController::class, 'updateUser'])
                ->name('settings.users.user.updateUser')
                ->middleware([RoleBasedAccess::class.':user_management,update']);

            // Delete User
            Route::delete('/', [UsersController::class, 'deleteUser'])
                ->name('settings.users.user.deleteUser')
                ->middleware([RoleBasedAccess::class.':user_management,delete']);
        });
    });

    // ACTIVITY LOG
    Route::get('activity-log', [ActivityLogController::class, 'renderActivityLogPage'])
        ->name('settings.activitylog.renderUsersPage')
        ->middleware([RoleBasedAccess::class.':user_access_management,read']);

});
