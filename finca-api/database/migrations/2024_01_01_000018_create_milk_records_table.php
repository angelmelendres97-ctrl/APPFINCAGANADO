<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('milk_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('animal_id')->constrained('animals')->onDelete('cascade');
            $table->date('record_date');
            $table->enum('milking_session', ['morning', 'afternoon', 'evening', 'total']);
            $table->decimal('quantity_liters', 10, 2);
            $table->text('quality_observation')->nullable();
            $table->decimal('temperature', 5, 2)->nullable();
            $table->boolean('mastitis_check')->default(false);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('milk_records');
    }
};