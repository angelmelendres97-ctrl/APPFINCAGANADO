<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LotMovement extends Model
{
    protected $fillable = ['lot_id', 'movement_type', 'movement_date', 'description', 'created_by'];
    protected $casts = ['movement_date' => 'date'];

    public function lot(): BelongsTo
    {
        return $this->belongsTo(Lot::class);
    }
}