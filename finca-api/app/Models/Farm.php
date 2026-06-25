<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Farm extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'business_name', 'owner_name', 'tax_id', 'phone', 'email',
        'country', 'province', 'city', 'address', 'latitude', 'longitude',
        'logo_path', 'active'
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'active' => 'boolean',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function lots(): HasMany
    {
        return $this->hasMany(Lot::class);
    }

    public function animals(): HasMany
    {
        return $this->hasMany(Animal::class);
    }

    public function feeds(): HasMany
    {
        return $this->hasMany(Feed::class);
    }

    public function settings(): HasMany
    {
        return $this->hasMany(Setting::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }
}