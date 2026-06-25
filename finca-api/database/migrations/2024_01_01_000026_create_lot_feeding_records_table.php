<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lot_feeding_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lot_id')->constrained('lots')->onDelete('cascade');
            $table->foreignId('feed_id')->nullable()->constrained('feeds')->onDelete('set null');
            $table->date('feeding_date');
            $table->decimal('quantity', 10, 2);
            $table->string('unit')->default('kg');
            $table->integer('estimated_animals')->nullable();
            $table->string('supplied_by')->nullable();
            $table->text('observations')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lot_feeding_records');
    }
};