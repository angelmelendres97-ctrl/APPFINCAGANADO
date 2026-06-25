<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_alert_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('alert_type_id')->nullable()->constrained('alert_types')->onDelete('set null');
            $table->foreignId('channel_id')->nullable()->constrained('notification_channels')->onDelete('set null');
            $table->boolean('enabled')->default(true);
            $table->timestamps();
            
            $table->unique(['user_id', 'alert_type_id', 'channel_id'], 'user_alert_pref_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_alert_preferences');
    }
};