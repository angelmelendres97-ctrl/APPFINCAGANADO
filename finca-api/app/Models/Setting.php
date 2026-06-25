<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Setting extends Model
{
    protected $fillable = ['farm_id', 'setting_key', 'setting_value', 'data_type', 'description'];

    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    public function getTypedValueAttribute(): mixed
    {
        return match($this->data_type) {
            'boolean' => filter_var($this->setting_value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $this->setting_value,
            'float' => (float) $this->setting_value,
            'json' => json_decode($this->setting_value, true),
            default => $this->setting_value,
        };
    }
}