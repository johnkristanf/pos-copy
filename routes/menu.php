<?php

use App\Http\Controllers\Menu\CreateOrderController;
use App\Http\Controllers\Menu\CustomersController;
use App\Http\Controllers\Menu\DashboardController;
use App\Http\Controllers\Menu\ProductsController;
use App\Http\Middleware\RoleBasedAccess;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {

    // DASHBOARD
    Route::prefix('dashboard')->group(function () {
        Route::get('/', [DashboardController::class, 'renderDashboardPage'])
            ->name('dashboard.renderDashboardPage')
            ->middleware([RoleBasedAccess::class.':reports_and_analytics,read']);

        Route::get('/lookup-item', [DashboardController::class, 'lookupItem'])
            ->name('dashboard.lookupItem');

    });

    // CUSTOMERS
    Route::prefix('customers')->group(function () {
        Route::get('/', [CustomersController::class, 'renderCustomersPage'])
            ->name('customers.renderCustomersPage')
            ->middleware([RoleBasedAccess::class.':customer_profile,read']);

        Route::post('/', [CustomersController::class, 'createCustomer'])
            ->name('customers.createCustomer')
            ->middleware([RoleBasedAccess::class.':customer_profile,create']);

        Route::post('/set/customer/credit', [CustomersController::class, 'setCustomerCredit'])
            ->name('customers.setCustomerCredit')
            ->middleware([RoleBasedAccess::class.':credit_rating,create']);

        Route::post('/pay/credit/order', [CustomersController::class, 'payCreditOrder'])
            ->name('customers.payCreditOrder')
            ->middleware([RoleBasedAccess::class.':receive_payment,create']);

        Route::get('/{customerId}', [CustomersController::class, 'renderCustomerProfilePage'])
            ->name('customers.renderCustomerProfilePage')
            ->middleware([RoleBasedAccess::class.':customer_profile,read']);

        Route::patch('/{customers}', [CustomersController::class, 'updateCustomer'])
            ->name('customers.updateCustomer')
            ->middleware([RoleBasedAccess::class.':customer_profile,update']);

        Route::delete('/{customers}', [CustomersController::class, 'deleteCustomer'])
            ->name('customers.deleteCustomer')
            ->middleware([RoleBasedAccess::class.':customer_profile,delete']);
    });

    // CREATE-ORDER
    Route::prefix('create-order')->group(function () {
        Route::get('/', [CreateOrderController::class, 'renderCreateOrderPage'])
            ->name('create-order.renderCreateOrderPage')
            ->middleware([RoleBasedAccess::class.':create_order,read']);

        Route::get('/search/customer', [CreateOrderController::class, 'searchCustomers'])
            ->name('create-order.searchCustomers')
            ->middleware([RoleBasedAccess::class.':customer_profile,read']);

        Route::get('/drafts', [CreateOrderController::class, 'getDrafts'])
            ->name('create-order.getDrafts')
            ->middleware([RoleBasedAccess::class.':create_order,read']);

    });

    // PRODUCTS
    Route::prefix('products')->group(function () {
        Route::get('/', [ProductsController::class, 'renderProductsPage'])
            ->name('products.renderProductsPage')
            ->middleware([RoleBasedAccess::class.':price_and_discount|create_order|quotation,read']);
    });
});
