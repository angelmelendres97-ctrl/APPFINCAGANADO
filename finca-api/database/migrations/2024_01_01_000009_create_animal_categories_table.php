<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('animal_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('species_id')->constrained('species')->onDelete('cascade');
            $table->string('name');
            $table->enum('sex_applicability', ['male', 'female', 'both'])->default('both');
            $table->text('description')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('animal_categories');
    }
};