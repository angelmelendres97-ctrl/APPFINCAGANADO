<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Animal extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'farm_id', 'lot_id', 'breed_id', 'category_id', 'status_id',
        'internal_code', 'ear_tag', 'name', 'sex', 'birth_date', 'estimated_age_months',
        'color', 'weight_current', 'height', 'origin_type', 'origin_description',
        'acquisition_date', 'mother_id', 'father_id', 'reproductive_stage',
        'productive_stage', 'milk_stage', 'meat_stage', 'genetic_info',
        'photo_path', 'notes', 'active', 'created_by', 'updated_by'
    ];

    protected $casts = [
        'birth_date' => 'date',
        'acquisition_date' => 'date',
        'weight_current' => 'decimal:2',
        'height' => 'decimal:2',
        'active' => 'boolean',
        'genetic_info' => 'array',
    ];

    protected $appends = ['full_code', 'formatted_age'];

    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    public function lot(): BelongsTo
    {
        return $this->belongsTo(Lot::class);
    }

    public function breed(): BelongsTo
    {
        return $this->belongsTo(Breed::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(AnimalCategory::class, 'category_id');
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(AnimalStatus::class, 'status_id');
    }

    public function mother(): BelongsTo
    {
        return $this->belongsTo(Animal::class, 'mother_id');
    }

    public function father(): BelongsTo
    {
        return $this->belongsTo(Animal::class, 'father_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function milkRecords(): HasMany
    {
        return $this->hasMany(MilkRecord::class);
    }

    public function meatRecords(): HasMany
    {
        return $this->hasMany(MeatRecord::class);
    }

    public function reproductiveRecords(): HasMany
    {
        return $this->hasMany(ReproductiveRecord::class);
    }

    public function healthRecords(): HasMany
    {
        return $this->hasMany(HealthRecord::class);
    }

    public function feedingRecords(): HasMany
    {
        return $this->hasMany(AnimalFeedingRecord::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(AnimalDocument::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(AnimalPhoto::class);
    }

    public function movements(): HasMany
    {
        return $this->hasMany(AnimalMovement::class);
    }

    public function getFullCodeAttribute(): string
    {
        return $this->internal_code;
    }

    public function getFormattedAgeAttribute(): string
    {
        if (!$this->birth_date) {
            return $this->estimated_age_months ? "{$this->estimated_age_months} meses" : 'N/A';
        }
        
        $years = $this->birth_date->age;
        if ($years < 1) {
            $months = $this->birth_date->diffInMonths();
            return "{$months} meses";
        }
        return "{$years} años";
    }
}