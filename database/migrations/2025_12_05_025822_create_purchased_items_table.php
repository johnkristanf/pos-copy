<?php

use App\Models\PurchasedItem;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class() extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('purchased_items', function (Blueprint $table) {
            $table->id();
            $table->uuid('purchase_order_item_id');

            $table->integer('purchased_quantity')->unsigned();
            $table->integer('stocked_in_quantity')->nullable()->unsigned();

            $table->decimal('discount', 15, 2)->nullable()->default(0);
            $table->decimal('unit_price', 15, 2)->nullable();

            $table->foreignId('purchase_id')->constrained('purchased');
            $table->foreignId('item_id')->constrained('items');

            $table->enum('status', [
                PurchasedItem::STATUS_PENDING,
                PurchasedItem::STATUS_PARTIALLY_STOCK_IN,
                PurchasedItem::STATUS_FULLY_STOCKED_IN,
            ])->default(PurchasedItem::STATUS_PENDING);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchased_items');
    }
};
