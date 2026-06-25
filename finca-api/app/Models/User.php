<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, SoftDeletes;

    protected $fillable = [
        'farm_id', 'role_id', 'first_name', 'last_name', 'document_number',
        'phone', 'email', 'password', 'avatar_path', 'status', 'last_login_at'
    ];

    protected $hidden = ['password', 'remember_token'];
    protected $casts = [
        'password' => 'hashed',
        'last_login_at' => 'datetime',
    ];

    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function userPermissions()
    {
        return $this->hasMany(UserPermission::class);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }
}