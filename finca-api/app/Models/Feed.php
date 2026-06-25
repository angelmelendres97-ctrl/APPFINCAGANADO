<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Feed extends Model
{
    protected $fillable = [
        'farm_id', 'name', 'feed_type', 'nutritional_description',
        'measurement_unit', 'stock_quantity', 'minimum_stock', 'active'
    ];

    protected $casts = [
        'stock_quantity' => 'decimal:2',
        'minimum_stock' => 'decimal:2',
        'active' => 'boolean',
    ];

    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    public function getStockPercentageAttribute(): int
    {
        if ($this->minimum_stock == 0) return 100;
        return (int) min(($this->stock_quantity / $this->minimum_stock) * 100, 100);
    }

    public function getIsLowStockAttribute(): bool
    {
        return $this->stock_quantity < $this->minimum_stock;
    }
}