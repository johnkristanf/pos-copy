<?php

use App\Http\Controllers\Operations\DiscountController;
use App\Http\Controllers\Operations\PaymentMethodController;
use App\Http\Controllers\Operations\StockLocationsController;
use App\Http\Controllers\Operations\VoidReasonController;
use App\Http\Controllers\Operations\VoucherController;
use App\Http\Middleware\RoleBasedAccess;
use Illuminate\Support\Facades\Route;

Route::prefix('operations')->middleware(['auth', 'verified'])->group(function () {

    // PAYMENT METHODS
    Route::prefix('payment-method')->group(function () {
        Route::get('/', [PaymentMethodController::class, 'renderPaymentMethodPage'])
            ->name('paymentMethod.renderPaymentMethodPage')
            ->middleware([RoleBasedAccess::class.':price_and_discount,read']);
    });

    // VOUCHERS
    Route::prefix('vouchers')->group(function () {
        Route::get('/', [VoucherController::class, 'renderVoucherPage'])
            ->name('vouchers.renderVoucherPage')
            ->middleware([RoleBasedAccess::class.':price_and_discount,read']);

        Route::post('/apply', [VoucherController::class, 'applyVoucher'])
            ->name('vouchers.apply')
            ->middleware([RoleBasedAccess::class.':price_and_discount,read']);

        Route::post('/', [VoucherController::class, 'createVoucher'])
            ->name('vouchers.create')
            ->middleware([RoleBasedAccess::class.':price_and_discount,create']);

        Route::put('{voucher}', [VoucherController::class, 'updateVoucher'])
            ->name('vouchers.update')
            ->middleware([RoleBasedAccess::class.':price_and_discount,update']);

        Route::delete('{voucher}', [VoucherController::class, 'deleteVoucher'])
            ->name('vouchers.delete')
            ->middleware([RoleBasedAccess::class.':price_and_discount,update']);
    });

    // VOID REASONS
    Route::prefix('void')->group(function () {
        Route::get('/', [VoidReasonController::class, 'renderVoidReasonsPage'])
            ->name('void.renderVoidReasonsPage')
            ->middleware([RoleBasedAccess::class.':price_and_discount,read']);

        Route::post('/', [VoidReasonController::class, 'createVoidReason'])
            ->name('void.createVoidReason')
            ->middleware([RoleBasedAccess::class.':price_and_discount,create']);

        Route::put('{voidReason}', [VoidReasonController::class, 'updateVoidReason'])
            ->name('void.updateVoidReason')
            ->middleware([RoleBasedAccess::class.':price_and_discount,update']);

        Route::delete('{voidReason}', [VoidReasonController::class, 'deleteVoidReason'])
            ->name('void.deleteVoidReason')
            ->middleware([RoleBasedAccess::class.':price_and_discount,update']);
    });

    // DISCOUNTS
    Route::prefix('discounts')->group(function () {
        Route::get('/', [DiscountController::class, 'renderDiscountPage'])
            ->name('discounts.renderDiscountPage')
            ->middleware([RoleBasedAccess::class.':price_and_discount,read']);

        Route::post('/', [DiscountController::class, 'createDiscount'])
            ->name('discounts.create')
            ->middleware([RoleBasedAccess::class.':price_and_discount,create']);

        Route::put('{discount}', [DiscountController::class, 'updateDiscount'])
            ->name('discounts.update')
            ->middleware([RoleBasedAccess::class.':price_and_discount,update']);

        Route::delete('{discount}', [DiscountController::class, 'deleteDiscount'])
            ->name('discounts.delete')
            ->middleware([RoleBasedAccess::class.':price_and_discount,update']);
    });

    // STOCK LOCATIONS
    Route::get('/stock-locations', [StockLocationsController::class, 'renderStockLocationPage'])
        ->name('operations.stock-locations')
        ->middleware([RoleBasedAccess::class.':tenant_management,read']);

    Route::post('/stock-locations', [StockLocationsController::class, 'createStockLocation'])
        ->name('operations.stock-locations.create')
        ->middleware([RoleBasedAccess::class.':tenant_management,update']);

    Route::put('/stock-locations/{stockLocation}', [StockLocationsController::class, 'updateStockLocation'])
        ->name('operations.stock-locations.update')
        ->middleware([RoleBasedAccess::class.':tenant_management,update']);

    Route::delete('/stock-locations/{stockLocation}', [StockLocationsController::class, 'deleteStockLocation'])
        ->name('operations.stock-locations.delete')
        ->middleware([RoleBasedAccess::class.':tenant_management,delete']);

});
