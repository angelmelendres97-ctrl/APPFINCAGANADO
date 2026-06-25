<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HealthRecord extends Model
{
    protected $fillable = [
        'animal_id', 'health_type_id', 'record_date', 'diagnosis',
        'medication_name', 'dosage', 'dosage_unit', 'route_of_administration',
        'veterinarian_name', 'next_due_date', 'response_status', 'notes', 'created_by'
    ];

    protected $casts = [
        'record_date' => 'date',
        'dosage' => 'decimal:2',
        'next_due_date' => 'date',
    ];

    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }

    public function healthType(): BelongsTo
    {
        return $this->belongsTo(HealthType::class, 'health_type_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}