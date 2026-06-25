<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alert extends Model
{
    protected $fillable = [
        'farm_id', 'animal_id', 'lot_id', 'alert_type_id', 'title',
        'message', 'alert_date', 'due_date', 'priority', 'status',
        'is_read', 'read_at', 'generated_by_rule', 'created_by'
    ];

    protected $casts = [
        'alert_date' => 'date',
        'due_date' => 'date',
        'read_at' => 'datetime',
        'is_read' => 'boolean',
        'generated_by_rule' => 'boolean',
    ];

    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }

    public function lot(): BelongsTo
    {
        return $this->belongsTo(Lot::class);
    }

    public function alertType(): BelongsTo
    {
        return $this->belongsTo(AlertType::class, 'alert_type_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}