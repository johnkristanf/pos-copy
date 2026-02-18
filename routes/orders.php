<?php

use App\Http\Controllers\Menu\CreateOrderController;
use App\Http\Controllers\Orders\ActiveOrdersController;
use App\Http\Controllers\Orders\AllOrdersController;
use App\Http\Controllers\Orders\CancelledOrdersController;
use App\Http\Controllers\Orders\CompleteOrdersController;
use App\Http\Middleware\RoleBasedAccess;
use Illuminate\Support\Facades\Route;

Route::prefix('orders')->middleware(['auth', 'verified'])->group(function () {

    // ALL ORDERS PAGE
    Route::get('all-orders', [AllOrdersController::class, 'renderAllOrdersPage'])
        ->name('orders.renderAllOrdersPage')
        ->middleware([RoleBasedAccess::class.':all_orders,read']);

    // CREATE ORDER ACTION
    Route::post('create', [CreateOrderController::class, 'createOrder'])
        ->name('orders.createOrder')
        ->middleware([RoleBasedAccess::class.':create_order,create']);

    // ACTIVE ORDERS PAGE
    Route::get('active-orders', [ActiveOrdersController::class, 'renderActiveOrdersPage'])
        ->name('orders.renderActiveOrdersPage')
        ->middleware([RoleBasedAccess::class.':all_orders,read']);

    // PROCESS PAYMENT / RECEIPT
    Route::post('process/receipt', [ActiveOrdersController::class, 'processOrderReceipt'])
        ->name('orders.processOrderReceipt')
        ->middleware([RoleBasedAccess::class.':receive_payment,create']);

    // COMPLETED ORDERS PAGE
    Route::get('completed-orders', [CompleteOrdersController::class, 'renderCompleteOrdersPage'])
        ->name('orders.renderCompleteOrdersPage')
        ->middleware([RoleBasedAccess::class.':all_orders,read']);

    // CANCELLED ORDERS PAGE
    Route::get('cancelled-orders', [CancelledOrdersController::class, 'renderCancelledOrdersPage'])
        ->name('orders.renderCancelledOrdersPage')
        ->middleware([RoleBasedAccess::class.':all_orders,read']);

    // SERVE ORDER
    Route::post('serve', [ActiveOrdersController::class, 'serveOrder'])
        ->name('orders.serveOrder')
        ->middleware([RoleBasedAccess::class.':inventory,create']);

    // VOID ORDER
    Route::post('void', [ActiveOrdersController::class, 'voidOrder'])
        ->name('orders.voidOrder')
        ->middleware([RoleBasedAccess::class.':all_orders,update']);

    // ACTIVE VOUCHERS
    Route::get('active-vouchers', [ActiveOrdersController::class, 'getManyActiveVoucers'])
        ->name('orders.getManyActiveVoucers')
        ->middleware([RoleBasedAccess::class.':all_orders,read']);

});
