<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AlertType extends Model
{
    protected $fillable = ['name', 'module', 'description', 'active'];
    protected $casts = ['active' => 'boolean'];
}