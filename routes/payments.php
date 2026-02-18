<?php

use App\Http\Controllers\Orders\PaymentController;
use App\Http\Middleware\RoleBasedAccess;
use Illuminate\Support\Facades\Route;

Route::prefix('payments')->middleware(['auth', 'verified'])->group(function () {

    // PROCESS PAYMENT
    Route::post('process', [PaymentController::class, 'processPayment'])
        ->name('payments.process')
        ->middleware([RoleBasedAccess::class.':receive_payment,create']);

});
