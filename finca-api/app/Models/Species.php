<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Species extends Model
{
    protected $fillable = ['name', 'scientific_name', 'description', 'active'];

    protected $casts = ['active' => 'boolean'];

    public function breeds(): HasMany
    {
        return $this->hasMany(Breed::class);
    }

    public function animalCategories(): HasMany
    {
        return $this->hasMany(AnimalCategory::class);
    }
}