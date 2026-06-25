<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $tables = [
            'farms', 'roles', 'permissions', 'users', 'settings',
            'species', 'breeds', 'animal_categories', 'animal_statuses',
            'lots', 'animals', 'animal_photos', 'document_types',
            'animal_documents', 'animal_movements', 'lot_movements',
            'milk_records', 'meat_records', 'reproductive_types',
            'reproductive_records', 'health_types', 'health_records',
            'feeds', 'animal_feeding_records', 'lot_feeding_records',
            'event_types', 'events', 'alert_types', 'alerts',
            'notification_channels', 'user_alert_preferences'
        ];

        foreach ($tables as $tableName) {
            if (Schema::hasTable($tableName) && !Schema::hasColumn($tableName, 'deleted_at')) {
                Schema::table($tableName, function (Blueprint $tableInstance) {
                    $tableInstance->softDeletes();
                });
            }
        }
    }

    public function down(): void
    {
        $tables = [
            'farms', 'roles', 'permissions', 'users', 'settings',
            'species', 'breeds', 'animal_categories', 'animal_statuses',
            'lots', 'animals', 'animal_photos', 'document_types',
            'animal_documents', 'animal_movements', 'lot_movements',
            'milk_records', 'meat_records', 'reproductive_types',
            'reproductive_records', 'health_types', 'health_records',
            'feeds', 'animal_feeding_records', 'lot_feeding_records',
            'event_types', 'events', 'alert_types', 'alerts',
            'notification_channels', 'user_alert_preferences'
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                Schema::table($table, function (Blueprint $tableInstance) {
                    $tableInstance->dropSoftDeletes();
                });
            }
        }
    }
};