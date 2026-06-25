<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentType extends Model
{
    protected $fillable = ['name', 'description', 'active'];
    protected $casts = ['active' => 'boolean'];
}