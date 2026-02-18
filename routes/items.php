<?php

use App\Http\Controllers\Items\BlobAttachmentsController;
use App\Http\Controllers\Items\CategoriesController;
use App\Http\Controllers\Items\InventoryController;
use App\Http\Controllers\Items\ItemController;
use App\Http\Controllers\Items\ItemSoldController;
use App\Http\Controllers\Items\PriceController;
use App\Http\Controllers\Items\StockAdjustmentController;
use App\Http\Controllers\Items\StockInController;
use App\Http\Controllers\Items\StockTransferController;
use App\Http\Controllers\Items\SupplierController;
use App\Http\Controllers\Items\UnitController;
use App\Http\Middleware\RoleBasedAccess;
use Illuminate\Support\Facades\Route;

Route::prefix('items')->middleware(['auth', 'verified'])->group(function () {

    // INVENTORY
    Route::get('inventory', [InventoryController::class, 'renderInventoryPage'])
        ->name('inventory.renderInventoryPage')
        ->middleware([RoleBasedAccess::class.':inventory,read']);

    // PRICE
    Route::prefix('price')->group(function () {
        Route::get('/', [PriceController::class, 'renderPricePage'])
            ->name('price.renderPricePage')
            ->middleware([RoleBasedAccess::class.':price_and_discount,read']);

        Route::post('/', [PriceController::class, 'attachItemSellingPrice'])
            ->name('price.attachItemSellingPrice')
            ->middleware([RoleBasedAccess::class.':price_and_discount,create']);

        Route::put('/{item}', [PriceController::class, 'updateItemSellingPrice'])
            ->name('price.updateItemSellingPrice')
            ->middleware([RoleBasedAccess::class.':price_and_discount,update']);

        Route::delete('/{item}', [PriceController::class, 'detachedItemSellingPrice'])
            ->name('price.detachedItemSellingPrice')
            ->middleware([RoleBasedAccess::class.':price_and_discount,delete']);
    });

    // STOCK IN
    Route::prefix('stock-in')->group(function () {
        Route::get('/', [StockInController::class, 'renderStockInPage'])
            ->name('stockin.renderStockInPage')
            ->middleware([RoleBasedAccess::class.':stock_in,read']);

        Route::post('/', [StockInController::class, 'createStock'])
            ->name('stockin.createStock')
            ->middleware([RoleBasedAccess::class.':stock_in,create']);
    });

    // STOCK TRANSFER
    Route::prefix('stock-transfer')->group(function () {
        Route::get('/', [StockTransferController::class, 'renderStrockTransferPage'])
            ->name('stocktransfer.renderStrockTransferPage')
            ->middleware([RoleBasedAccess::class.':stock_transfer,read']);

        Route::post('/', [StockTransferController::class, 'stockTransfer'])
            ->middleware([RoleBasedAccess::class.':stock_transfer,create']);
    });

    // STOCK ADJUSTMENT
    Route::prefix('adjustment')->group(function () {
        Route::get('/', [StockAdjustmentController::class, 'renderStockAdjustmentPage'])
            ->name('stockAdjustment.renderStockAdjustmentPage')
            ->middleware([RoleBasedAccess::class.':inventory,read']);

        Route::post('/create', [StockAdjustmentController::class, 'create'])
            ->name('stockAdjustment.create')
            ->middleware([RoleBasedAccess::class.':inventory,create']);

        Route::post('/stock-adjust/setchecked/{stockAdjustment}', [StockAdjustmentController::class, 'setChecked'])
            ->name('stockAdjustment.setChecked')
            ->middleware([RoleBasedAccess::class.':item_management,approve']);

        Route::post('/stock-adjust/approve/{stockAdjustment}', [StockAdjustmentController::class, 'approve'])
            ->name('stockAdjustment.approve')
            ->middleware([RoleBasedAccess::class.':item_management,approve']);

        Route::post('/stock-adjust/reject/{stockAdjustment}', [StockAdjustmentController::class, 'reject'])
            ->name('stockAdjustment.reject')
            ->middleware([RoleBasedAccess::class.':item_management,approve']);
    });

    // ITEM
    Route::get('item', [ItemController::class, 'renderItemPage'])
        ->name('items.renderItemPage')
        ->middleware([RoleBasedAccess::class.':item_management,read']);

    Route::post('/', [ItemController::class, 'createItem'])
        ->name('items.createItem')
        ->middleware([RoleBasedAccess::class.':item_management,create']);

    Route::patch('/{items}', [ItemController::class, 'updateItem'])
        ->name('items.updateItem')
        ->middleware([RoleBasedAccess::class.':item_management,update']);

    Route::delete('/{items}', [ItemController::class, 'deleteItem'])
        ->name('items.deleteItem')
        ->middleware([RoleBasedAccess::class.':item_management,delete']);

    // ITEM SOLD
    Route::prefix('item-sold')->group(function () {
        Route::get('/', [ItemSoldController::class, 'renderItemSoldPage'])
            ->name('itemSold.renderItemSoldPage')
            ->middleware([RoleBasedAccess::class.':reports_and_analytics,read']);
    });

    // ITEM CATEGORY
    Route::prefix('categories')->group(function () {
        Route::get('/', [CategoriesController::class, 'renderCategoryPage'])
            ->name('categories.renderCategoryPage')
            ->middleware([RoleBasedAccess::class.':item_management,read']);

        Route::post('/', [CategoriesController::class, 'createCategory'])
            ->name('categories.createCategory')
            ->middleware([RoleBasedAccess::class.':item_management,create']);

        Route::patch('/{category}', [CategoriesController::class, 'updateCategory'])
            ->name('categories.updateCategory')
            ->middleware([RoleBasedAccess::class.':item_management,update']);

        Route::delete('/{category}', [CategoriesController::class, 'deleteCategory'])
            ->name('categories.deleteCategory')
            ->middleware([RoleBasedAccess::class.':item_management,delete']);
    });

    // UNIT OF MEASURE
    Route::prefix('units')->group(function () {
        Route::get('', [UnitController::class, 'renderUnitOfMeasurePage'])
            ->name('units.renderUnitOfMeasurePage')
            ->middleware([RoleBasedAccess::class.':item_management,read']);

        Route::post('/', [UnitController::class, 'createUnit'])
            ->name('units.createUnit')
            ->middleware([RoleBasedAccess::class.':item_management,create']);

        Route::patch('/{unit}', [UnitController::class, 'updateUnit'])
            ->name('units.updateUnit')
            ->middleware([RoleBasedAccess::class.':item_management,update']);

        Route::delete('/{unit}', [UnitController::class, 'deleteUnit'])
            ->name('units.deleteUnit')
            ->middleware([RoleBasedAccess::class.':item_management,delete']);
    });

    // SUPPLIERS
    Route::prefix('supplier')->group(function () {
        Route::get('', [SupplierController::class, 'renderSupplierPage'])
            ->name('supplier.renderSupplierPage')
            ->middleware([RoleBasedAccess::class.':return_to_supplier,read']);

        Route::post('/', [SupplierController::class, 'createSupplier'])
            ->name('suppliers.createSupplier')
            ->middleware([RoleBasedAccess::class.':return_to_supplier,create']);

        Route::patch('/{suppliers}', [SupplierController::class, 'updateSupplier'])
            ->name('suppliers.updateSupplier')
            ->middleware([RoleBasedAccess::class.':return_to_supplier,update']);

        Route::delete('/{suppliers}', [SupplierController::class, 'deleteSupplier'])
            ->name('suppliers.deleteSupplier')
            ->middleware([RoleBasedAccess::class.':return_to_supplier,delete']);
    });

    // ASSEMBLE
    Route::prefix('assemble')->group(function () {
        Route::post('/', [ItemController::class, 'assembleItem'])
            ->name('assemble.assembleItem')
            ->middleware([RoleBasedAccess::class.':item_management,update']);
    });

    // BLOB-ATTACHMENTS
    Route::prefix('blob-attachments')->group(function () {
        Route::get('/', [BlobAttachmentsController::class, 'getManyBlobAttachments'])
            ->name('blob-attachments.getManyBlobAttachments');

        Route::post('/', [BlobAttachmentsController::class, 'uploadBlobAttachmentById'])
            ->name('blob-attachments.uploadBlobAttachmentById');

        Route::get('/{id}', [BlobAttachmentsController::class, 'getBlobAttachmentById'])
            ->name('blob-attachments.getBlobAttachmentById')
            ->middleware([RoleBasedAccess::class.':item_management|user_management,read']);

        Route::post('/{id}', [BlobAttachmentsController::class, 'updateBlobAttachmentById'])
            ->name('blob-attachments.updateBlobAttachmentById');

        Route::delete('/{id}', [BlobAttachmentsController::class, 'deleteBlobAttachmentById'])
            ->name('blob-attachments.deleteBlobAttachmentById');
    });
});
