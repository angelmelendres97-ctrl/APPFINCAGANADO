<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->nullable()->constrained('farms')->onDelete('set null');
            $table->string('name');
            $table->string('category');
            $table->integer('stock_current');
            $table->integer('stock_minimum');
            $table->string('unit');
            $table->decimal('unit_price', 10, 2)->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('supplier')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_items');
    }
};
