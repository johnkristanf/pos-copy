<?php

use App\Models\Payments;
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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->nullable()->unique();
            $table->decimal('total_payable', 12, 2)->default(0);
            $table->enum('payment_status', [Payments::FULLY_PAID, Payments::PARTIALLY_PAID, Payments::PENDING])
                ->default(Payments::PENDING);

            $table->boolean('is_draft')->default(false);
            $table->boolean('is_void')->default(false);
            $table->foreignId('payment_method_id')->constrained('payment_methods');
            $table->foreignId('customer_id')->constrained('customers');

            $table->foreignId('used_voucher')->nullable()->constrained('vouchers');
            $table->decimal('vouchers_used', 12, 2)->nullable();

            $table->timestamps();
            // Example: '2024-06-23 12:34:56' can be used as a WHERE value in this column
            // e.g., ->where('created_at', '2024-06-23 12:34:56')

            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
