<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AnimalStatus extends Model
{
    protected $fillable = ['name', 'category', 'description', 'active'];

    protected $casts = ['active' => 'boolean'];

    public function animals(): HasMany
    {
        return $this->hasMany(Animal::class);
    }
}