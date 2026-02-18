<?php

use App\Http\Controllers\Auth\AuthenticationController;
use App\Http\Controllers\Auth\EmailVerificationController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    // LOGIN
    Route::get('login', [AuthenticationController::class, 'renderLoginPage'])
        ->name('login');

    Route::post('login', [AuthenticationController::class, 'loginUser'])
        ->name('login.loginUser');

    // PASSWORD RESET
    Route::get('forgot-password', [AuthenticationController::class, 'renderForgotPasswordPage'])
        ->name('password.renderForgotPasswordPage');

    Route::post('forgot-password', [AuthenticationController::class, 'sendResetPasswordByEmail'])
        ->name('password.sendResetPasswordByEmail');

    Route::get('reset-password/{token}', [AuthenticationController::class, 'renderResetPasswordPage'])
        ->name('password.renderResetPasswordPage');

    Route::post('reset-password', [AuthenticationController::class, 'resetUserPassword'])
        ->name('password.resetUserPassword');
});

Route::middleware('auth')->group(function () {
    // VERIFY EMAIL
    Route::get('verify-email', [EmailVerificationController::class, 'showEmailVerificationPrompt'])
        ->name('verification.showEmailVerificationPrompt');

    Route::get('verify-email/{id}/{hash}', [EmailVerificationController::class, 'verifyUserByEmail'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verifyUserByEmail');

    Route::post('email/verification-notification', [EmailVerificationController::class, 'sendEmailVerificationLinkByEmail'])
        ->middleware('throttle:6,1')
        ->name('verification.sendEmailVerificationLinkByEmail');

    // PASSWORD UPDATE
    Route::put('update-password', [AuthenticationController::class, 'updateUserPassword'])
        ->name('password.updateUserPassword');

    // LOGOUT
    Route::post('logout', [AuthenticationController::class, 'logoutUser'])
        ->name('logout.logoutUser');
});
