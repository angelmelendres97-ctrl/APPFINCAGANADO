<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnimalDocument extends Model
{
    protected $fillable = [
        'animal_id', 'document_type_id', 'title', 'description',
        'file_name', 'file_path', 'mime_type', 'file_size',
        'issue_date', 'expiration_date', 'uploaded_by'
    ];

    protected $casts = ['issue_date' => 'date', 'expiration_date' => 'date'];

    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }

    public function documentType(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class, 'document_type_id');
    }
}