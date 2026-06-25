<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->constrained('farms')->onDelete('cascade');
            $table->string('code');
            $table->string('name');
            $table->enum('type', ['pasture', 'corral', 'pen', 'barn'])->default('pasture');
            $table->text('location_description')->nullable();
            $table->decimal('area_size', 10, 2)->nullable();
            $table->string('area_unit')->default('hectares');
            $table->integer('capacity')->nullable();
            $table->integer('current_animals_count')->default(0);
            $table->string('water_source')->nullable();
            $table->boolean('shade_available')->default(false);
            $table->enum('status', ['active', 'inactive', 'maintenance'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lots');
    }
};