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
        Schema::create('api_keys', function (Blueprint $table) {
            $table->id();
            $table->string('type')->default('inbound')->comment('inbound, outbound');
            $table->string('label');
            $table->string('key', 255);
            $table->boolean('isactive')->default(true);

            // Foreign IDs
            $table->uuid('app_id');
            $table->foreignId('key_expiration_id')->constrained('key_expiration_options')->onDelete('no action');

            // Dates
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('last_rolled_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_keys');
    }
};
