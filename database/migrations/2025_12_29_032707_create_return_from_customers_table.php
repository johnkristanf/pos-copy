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
        Schema::create('return_from_customers', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->date('invoice_issued_date');
            $table->text('reason');
            $table->foreignId('customer_id')->constrained('customers');

            $table->foreignId('prepared_by')->nullable()->constrained('users');
            $table->foreignId('check_by')->nullable()->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->foreignId('rejected_by')->nullable()->constrained('users');

            $statuses = config('statuses.returns_from_customer');
            $table->enum('status', array_values($statuses))->default(config('statuses.returns_from_customer.for_checking'));
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('return_from_customers');
    }
};
