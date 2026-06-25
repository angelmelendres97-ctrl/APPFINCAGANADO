<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lot extends Model
{
    protected $fillable = [
        'farm_id', 'code', 'name', 'type', 'location_description',
        'area_size', 'area_unit', 'capacity', 'current_animals_count',
        'water_source', 'shade_available', 'status', 'notes'
    ];

    protected $casts = [
        'area_size' => 'decimal:2',
        'capacity' => 'integer',
        'current_animals_count' => 'integer',
        'shade_available' => 'boolean',
    ];

    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    public function animals(): HasMany
    {
        return $this->hasMany(Animal::class);
    }

    public function lotMovements(): HasMany
    {
        return $this->hasMany(LotMovement::class);
    }

    public function lotFeedingRecords(): HasMany
    {
        return $this->hasMany(LotFeedingRecord::class);
    }

    public function getOccupancyPercentageAttribute(): int
    {
        if ($this->capacity == 0) return 0;
        return (int) (($this->current_animals_count / $this->capacity) * 100);
    }
}