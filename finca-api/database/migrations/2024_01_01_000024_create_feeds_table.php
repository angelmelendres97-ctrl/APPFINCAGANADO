<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feeds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->constrained('farms')->onDelete('cascade');
            $table->string('name');
            $table->enum('feed_type', ['concentrate', 'forage', 'supplement', 'mineral', 'additive']);
            $table->text('nutritional_description')->nullable();
            $table->string('measurement_unit')->default('kg');
            $table->decimal('stock_quantity', 10, 2)->nullable();
            $table->decimal('minimum_stock', 10, 2)->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feeds');
    }
};