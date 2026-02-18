<?php

use App\Http\Controllers\Integration\IntegrationController;
use App\Http\Controllers\Orders\ActiveOrdersController;
use Illuminate\Support\Facades\Route;

Route::prefix('integrations')->group(function () {
    Route::post('/store/purchased/item', [IntegrationController::class, 'storePurchasedItem'])
        ->middleware(['verify.api-key:stock_in,create']);
});

// TESTING ENDPOINTS
// Route::post('/orders/process/receipt', [ActiveOrdersController::class, 'processOrderReceipt']);
