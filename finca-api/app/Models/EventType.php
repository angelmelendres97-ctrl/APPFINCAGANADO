<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventType extends Model
{
    protected $fillable = ['name', 'scope', 'description', 'active'];
    protected $casts = ['active' => 'boolean'];
}