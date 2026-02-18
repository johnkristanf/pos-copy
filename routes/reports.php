<?php

use App\Http\Controllers\Reports\PriceReportController;
use App\Http\Controllers\Reports\SalesReportController;
use App\Http\Middleware\RoleBasedAccess;
use Illuminate\Support\Facades\Route;

Route::prefix('reports')->middleware(['auth', 'verified'])->group(function () {

    // SALES REPORT PAGE
    Route::get('sales-report', [SalesReportController::class, 'renderSalesReportPage'])
        ->name('reports.sales.renderSalesReportPage')
        ->middleware([RoleBasedAccess::class.':reports_and_analytics,read']);

    // AFFILIATED REPORT VOLUME
    Route::get('sales-report/top-affiliated-volume', [SalesReportController::class, 'getTopAffiliatedVolume'])
        ->name('reports.sales.topAffiliatedVolume')
        ->middleware([RoleBasedAccess::class.':reports_and_analytics,read']);

    // NON-AFFILIATED REPORT VOLUME
    Route::get('sales-report/top-nonaffiliated-volume', [SalesReportController::class, 'getTopNonAffiliatedVolume'])
        ->name('reports.sales.topNonAffiliatedVolume')
        ->middleware([RoleBasedAccess::class.':reports_and_analytics,read']);

    // ITEM CATEGORY SALES REPORT
    Route::get('sales-report/item-category-sales', [SalesReportController::class, 'getItemCategorySales'])
        ->name('reports.sales.itemCategorySales')
        ->middleware([RoleBasedAccess::class.':reports_and_analytics,read']);

    // TOP CUSTOMERS SALES REPORT
    Route::get('sales-report/customer-sales', [SalesReportController::class, 'getCustomerSales'])
        ->name('reports.sales.customerSales')
        ->middleware([RoleBasedAccess::class.':reports_and_analytics,read']);

    // TOTAL SALES
    Route::get('sales-report/total-sales', [SalesReportController::class, 'getTotalSales'])
        ->name('reports.sales.totalSales')
        ->middleware([RoleBasedAccess::class.':reports_and_analytics,read']);

    // PRICE REPORT PAGE
    Route::get('price-report', [PriceReportController::class, 'renderPriceReportPage'])
        ->name('reports.price.renderPriceReportPage')
        ->middleware([RoleBasedAccess::class.':price_analysis_report,read']);

    // TOTAL REVENUE PRICE REPORT
    Route::get('price-report/total-revenue', [PriceReportController::class, 'getTotalRevenue'])
        ->name('reports.price.totalRevenue')
        ->middleware([RoleBasedAccess::class.':price_analysis_report,read']);

    // FAST MOVING ITEMS
    Route::get('price-report/fast-moving-items', [PriceReportController::class, 'getFastMovingItems'])
        ->name('reports.price.fastMovingItems')
        ->middleware([RoleBasedAccess::class.':price_analysis_report,read']);

    // SLOW MOVING ITEMS
    Route::get('price-report/slow-moving-items', [PriceReportController::class, 'getSlowMovingItems'])
        ->name('reports.price.slowMovingItems')
        ->middleware([RoleBasedAccess::class.':price_analysis_report,read']);
});
