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
        Schema::create('return_from_customer_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('return_id')->constrained('return_from_customers');
            $table->foreignId('item_id')->constrained('items');
            $table->unsignedInteger('quantity');
            $table->foreignId('stock_location_id')->constrained('stock_locations');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('return_from_customer_items');
    }
};
