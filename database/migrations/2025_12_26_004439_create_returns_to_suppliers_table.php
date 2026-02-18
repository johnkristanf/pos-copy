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
        Schema::create('returns_to_suppliers', function (Blueprint $table) {
            $table->id();
            $table->enum('type', [config('types.returns_to_supplier.offset'), config('types.returns_to_supplier.replacement')]);
            $table->text('remarks')->nullable();
            $table->enum('status', [
                config('statuses.returns_to_supplier.for_checking'),
                config('statuses.returns_to_supplier.for_approval'),
                config('statuses.returns_to_supplier.pending'),
                config('statuses.returns_to_supplier.approved'),
                config('statuses.returns_to_supplier.rejected'),
            ])
                ->default(config('statuses.returns_to_supplier.for_checking'));

            $table->foreignId('supplier_id')->constrained('suppliers');

            $table->foreignId('prepared_by')->constrained('users');
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
        Schema::dropIfExists('returns_to_suppliers');
    }
};
