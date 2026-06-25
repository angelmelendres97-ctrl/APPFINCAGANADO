<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('health_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('animal_id')->constrained('animals')->onDelete('cascade');
            $table->foreignId('health_type_id')->nullable()->constrained('health_types')->onDelete('set null');
            $table->date('record_date');
            $table->text('diagnosis')->nullable();
            $table->string('medication_name')->nullable();
            $table->decimal('dosage', 10, 2)->nullable();
            $table->string('dosage_unit')->nullable();
            $table->enum('route_of_administration', ['oral', 'intramuscular', 'subcutaneous', 'intravenous', 'topical'])->nullable();
            $table->string('veterinarian_name')->nullable();
            $table->date('next_due_date')->nullable();
            $table->enum('response_status', ['pending', 'improving', 'resolved', 'recurring'])->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('health_records');
    }
};