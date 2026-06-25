<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnimalMovement extends Model
{
    protected $fillable = [
        'animal_id', 'from_lot_id', 'to_lot_id', 'movement_date', 'reason', 'notes', 'created_by'
    ];

    protected $casts = ['movement_date' => 'date'];

    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }

    public function fromLot(): BelongsTo
    {
        return $this->belongsTo(Lot::class, 'from_lot_id');
    }

    public function toLot(): BelongsTo
    {
        return $this->belongsTo(Lot::class, 'to_lot_id');
    }
}