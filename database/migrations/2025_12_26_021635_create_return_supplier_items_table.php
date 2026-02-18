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
        Schema::create('return_supplier_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('returns_id')->constrained('returns_to_suppliers')->onDelete('cascade');
            $table->foreignId('item_id')->constrained('items');

            $table->enum('deduction_source_type', [
              config('types.returns_to_supplier.stock'),
              config('types.returns_to_supplier.purchase'),
            ]);

            $table->unsignedBigInteger('deduction_source_id')->comment('ID of stock or purchase depending on deduction_source_type');
            $table->integer('quantity');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('return_supplier_items');
    }
};
