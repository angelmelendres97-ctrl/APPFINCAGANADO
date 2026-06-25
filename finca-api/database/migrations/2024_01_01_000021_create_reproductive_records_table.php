<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reproductive_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('animal_id')->constrained('animals')->onDelete('cascade');
            $table->foreignId('reproductive_type_id')->nullable()->constrained('reproductive_types')->onDelete('set null');
            $table->date('event_date');
            $table->foreignId('related_male_animal_id')->nullable()->constrained('animals')->onDelete('set null');
            $table->string('semen_code')->nullable();
            $table->string('technician_name')->nullable();
            $table->date('expected_delivery_date')->nullable();
            $table->enum('result', ['pending', 'positive', 'negative', 'unknown'])->nullable();
            $table->integer('offspring_count')->default(0);
            $table->text('observations')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reproductive_records');
    }
};