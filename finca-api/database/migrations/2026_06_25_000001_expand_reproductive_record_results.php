<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE reproductive_records MODIFY result ENUM('pending', 'positive', 'negative', 'unknown', 'completed') NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE reproductive_records MODIFY result ENUM('pending', 'positive', 'negative', 'unknown') NULL");
    }
};
