<?php

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
        Schema::create('order_item_serve_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_item_id')->constrained('order_items');
            $table->foreignId('stock_location_id')->constrained('stock_locations');
            $table->integer('quantity_to_serve');
            $table->integer('quantity_served')->default(0);

            $table->enum('status', [
                config('statuses.order_item.served'),
                config('statuses.order_item.partially_served'),
                config('statuses.order_item.unserved')])
                ->default(config('statuses.order_item.unserved'));

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_item_serve_locations');
    }
};
