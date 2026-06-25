<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('animals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->constrained('farms')->onDelete('cascade');
            $table->foreignId('lot_id')->nullable()->constrained('lots')->onDelete('set null');
            $table->foreignId('breed_id')->nullable()->constrained('breeds')->onDelete('set null');
            $table->foreignId('category_id')->nullable()->constrained('animal_categories')->onDelete('set null');
            $table->foreignId('status_id')->nullable()->constrained('animal_statuses')->onDelete('set null');
            $table->string('internal_code')->unique();
            $table->string('ear_tag')->nullable();
            $table->string('name')->nullable();
            $table->enum('sex', ['male', 'female']);
            $table->date('birth_date')->nullable();
            $table->integer('estimated_age_months')->nullable();
            $table->string('color')->nullable();
            $table->decimal('weight_current', 10, 2)->nullable();
            $table->decimal('height', 8, 2)->nullable();
            $table->enum('origin_type', ['born', 'purchased', 'donation'])->default('born');
            $table->text('origin_description')->nullable();
            $table->date('acquisition_date')->nullable();
            $table->foreignId('mother_id')->nullable()->constrained('animals')->onDelete('set null');
            $table->foreignId('father_id')->nullable()->constrained('animals')->onDelete('set null');
            $table->enum('reproductive_stage', ['juvenile', 'puberty', 'active', 'rest', 'unsuitable'])->nullable();
            $table->enum('productive_stage', ['growing', 'productive', 'drying', 'rest'])->nullable();
            $table->enum('milk_stage', ['dry', 'lactating', 'transition'])->nullable();
            $table->enum('meat_stage', ['creep', 'backgrounding', 'finishing', 'ready'])->nullable();
            $table->json('genetic_info')->nullable();
            $table->string('photo_path')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('animals');
    }
};