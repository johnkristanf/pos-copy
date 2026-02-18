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
        Schema::create('key_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('endpoint');
            $table->string('request_method');
            $table->ipAddress('ip_address');
            $table->string('device_info', 50);
            $table->string('device_type', 50);
            $table->string('browser', 50);
            $table->string('platform', 50);
            $table->foreignId('api_key_id')->constrained('api_keys')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('key_audit_logs');
    }
};
