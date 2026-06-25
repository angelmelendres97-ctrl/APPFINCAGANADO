<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnimalFeedingRecord extends Model
{
    protected $fillable = [
        'animal_id', 'feed_id', 'feeding_date', 'quantity', 'unit',
        'frequency', 'supplied_by', 'observations', 'created_by'
    ];

    protected $casts = [
        'feeding_date' => 'date',
        'quantity' => 'decimal:2',
    ];

    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }

    public function feed(): BelongsTo
    {
        return $this->belongsTo(Feed::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}