<?php

use App\Models\Stock;
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
        // KEY FIX: Use Schema::create, NOT Schema::table
        Schema::create('stock_adjustments', function (Blueprint $table) {
            $table->id(); // Creates the table with an ID

            $table->integer('quantity');
            // Ensure you have these constants in your Stock model or use strings like 'increase'/'deduct'
            $table->enum('action', [Stock::INCREASE, Stock::DEDUCT]);
            // Ensure your config exists, otherwise default to 'pending'
            $table->enum('status', array_values(config('statuses.adjustments') ?? ['pending', 'approved', 'rejected']))->default('pending');

            $table->foreignId('item_id')->constrained('items');
            $table->foreignId('location_id')->constrained('stock_locations');

            // The user tracking columns
            $table->foreignId('prepared_by')->nullable()->constrained('users');
            $table->foreignId('checked_by')->nullable()->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->foreignId('rejected_by')->nullable()->constrained('users');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_adjustments');
    }
};
