<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MeatRecord extends Model
{
    protected $fillable = [
        'animal_id', 'record_date', 'live_weight', 'daily_gain',
        'body_condition_score', 'fattening_stage', 'muscle_observation',
        'estimated_yield', 'notes', 'created_by'
    ];

    protected $casts = [
        'record_date' => 'date',
        'live_weight' => 'decimal:2',
        'daily_gain' => 'decimal:2',
        'body_condition_score' => 'integer',
        'estimated_yield' => 'decimal:2',
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