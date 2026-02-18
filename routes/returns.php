<?php

use App\Http\Controllers\Returns\ReturnFromCustomerController;
use App\Http\Controllers\Returns\ReturnToSupplierController;
use App\Http\Middleware\RoleBasedAccess;
use Illuminate\Support\Facades\Route;

Route::prefix('return')->middleware(['auth', 'verified'])->group(function () {

    // RETURNS FROM CUSTOMERS
    Route::get('from-customer', [ReturnFromCustomerController::class, 'renderReturnFromCustomerPage'])
        ->name('return.renderReturnFromCustomerPage')
        ->middleware([RoleBasedAccess::class.':return_from_customer,read']);

    Route::post('from-customer/form/create', [ReturnFromCustomerController::class, 'createRFCForm'])
        ->middleware([RoleBasedAccess::class.':'.config('features.return_from_customer.tag').','.config('permissions.create')]);

    Route::patch('from-customer/check/{id}', [ReturnFromCustomerController::class, 'setRFCFormToChecked'])
        ->middleware([RoleBasedAccess::class.':'.config('features.return_from_customer.tag').','.config('permissions.approve')]);

    Route::patch('from-customer/approve/{id}', [ReturnFromCustomerController::class, 'approveRFCForm'])
        ->middleware([RoleBasedAccess::class.':'.config('features.return_from_customer.tag').','.config('permissions.approve')]);

    Route::patch('from-customer/reject/{id}', [ReturnFromCustomerController::class, 'rejectRFCForm'])
        ->middleware([RoleBasedAccess::class.':'.config('features.return_from_customer.tag').','.config('permissions.approve')]);

    // ALL ITEMS ORDERED BY SPECIFIC CUSTOMER
    Route::get('from-customer/items-ordered/{customerID}', [ReturnFromCustomerController::class, 'getItemsOrderedByCustomer'])
        ->middleware([RoleBasedAccess::class.':'.config('features.return_from_customer.tag').','.config('permissions.read')]);

    // ALL INVOICE NUMBER BY SPECIFIC CUSTOMER
    Route::get('from-customer/invoice-numbers/{customerID}', [ReturnFromCustomerController::class, 'getInvoiceNumberByCustomer'])
        ->middleware([RoleBasedAccess::class.':'.config('features.return_from_customer.tag').','.config('permissions.read')]);

    // RETURNS TO SUPPLIER
    Route::get('to-supplier', [ReturnToSupplierController::class, 'renderReturnToSupplierPage'])
        ->name('return.renderReturnToSupplierPage')
        ->middleware([RoleBasedAccess::class.':'.config('features.return_to_supplier.tag').','.config('permissions.read')]);

    Route::post('to-supplier/form/create', [ReturnToSupplierController::class, 'createRTSForm'])
        ->middleware([RoleBasedAccess::class.':'.config('features.return_to_supplier.tag').','.config('permissions.create')]);

    Route::patch('to-supplier/check/{id}', [ReturnToSupplierController::class, 'setRTSFormToChecked'])
        ->middleware([RoleBasedAccess::class.':'.config('features.return_from_customer.tag').','.config('permissions.approve')]);

    Route::patch('to-supplier/approve/{id}', [ReturnToSupplierController::class, 'approveRTSForm'])
        ->middleware([RoleBasedAccess::class.':'.config('features.return_to_supplier.tag').','.config('permissions.approve')]);

    Route::patch('to-supplier/reject/{id}', [ReturnToSupplierController::class, 'rejectRTSForm'])
        ->middleware([RoleBasedAccess::class.':'.config('features.return_to_supplier.tag').','.config('permissions.approve')]);

    Route::get('to-supplier/search-suppliers', [ReturnToSupplierController::class, 'searchSuppliers'])
        ->middleware([RoleBasedAccess::class.':'.config('features.return_to_supplier.tag').','.config('permissions.read')]);

    // ALL ITEMS UNDER A SPECIFIC SUPPLIER
    Route::get('to-supplier/items/{supplierID}', [ReturnToSupplierController::class, 'getItemsUnderSupplier'])
        ->middleware([RoleBasedAccess::class.':'.config('features.return_to_supplier.tag').','.config('permissions.read')]);

});
