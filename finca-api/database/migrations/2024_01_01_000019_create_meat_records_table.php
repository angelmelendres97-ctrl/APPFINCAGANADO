<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meat_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('animal_id')->constrained('animals')->onDelete('cascade');
            $table->date('record_date');
            $table->decimal('live_weight', 10, 2);
            $table->decimal('daily_gain', 8, 2)->nullable();
            $table->integer('body_condition_score')->nullable();
            $table->enum('fattening_stage', ['creep', 'backgrounding', 'finishing'])->nullable();
            $table->text('muscle_observation')->nullable();
            $table->decimal('estimated_yield', 5, 2)->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meat_records');
    }
};