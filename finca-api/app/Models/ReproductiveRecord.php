<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReproductiveRecord extends Model
{
    protected $fillable = [
        'animal_id', 'reproductive_type_id', 'event_date', 'related_male_animal_id',
        'semen_code', 'technician_name', 'expected_delivery_date', 'result',
        'offspring_count', 'observations', 'created_by'
    ];

    protected $casts = [
        'event_date' => 'date',
        'expected_delivery_date' => 'date',
        'offspring_count' => 'integer',
    ];

    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }

    public function reproductiveType(): BelongsTo
    {
        return $this->belongsTo(ReproductiveType::class, 'reproductive_type_id');
    }

    public function relatedMale(): BelongsTo
    {
        return $this->belongsTo(Animal::class, 'related_male_animal_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}