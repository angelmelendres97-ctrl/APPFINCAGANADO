<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LotFeedingRecord extends Model
{
    protected $fillable = [
        'lot_id', 'feed_id', 'feeding_date', 'quantity', 'unit',
        'estimated_animals', 'supplied_by', 'observations', 'created_by'
    ];

    protected $casts = [
        'feeding_date' => 'date',
        'quantity' => 'decimal:2',
        'estimated_animals' => 'integer',
    ];

    public function lot(): BelongsTo
    {
        return $this->belongsTo(Lot::class);
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