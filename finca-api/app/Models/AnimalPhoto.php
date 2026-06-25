<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnimalPhoto extends Model
{
    protected $fillable = ['animal_id', 'file_name', 'file_path', 'file_type', 'description', 'uploaded_by'];

    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}