<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MilkRecord extends Model
{
    protected $fillable = [
        'animal_id', 'record_date', 'milking_session', 'quantity_liters',
        'quality_observation', 'temperature', 'mastitis_check', 'notes', 'created_by'
    ];

    protected $casts = [
        'record_date' => 'date',
        'quantity_liters' => 'decimal:2',
        'temperature' => 'decimal:2',
        'mastitis_check' => 'boolean',
    ];

    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}