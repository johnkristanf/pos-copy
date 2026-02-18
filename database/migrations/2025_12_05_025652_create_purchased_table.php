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
        Schema::create('purchased', function (Blueprint $table) {
            $table->id();
            $table->uuid('purchase_order_id');
            $table->date('received_at')->nullable();
            $table->string('acknowledgment_receipt', 255)->nullable();
            $table->string('remarks', 1000)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchased');
    }
};
