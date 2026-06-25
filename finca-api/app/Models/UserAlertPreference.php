<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserAlertPreference extends Model
{
    protected $fillable = ['user_id', 'alert_type_id', 'channel_id', 'enabled'];
    protected $casts = ['enabled' => 'boolean'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function alertType(): BelongsTo
    {
        return $this->belongsTo(AlertType::class, 'alert_type_id');
    }

    public function channel(): BelongsTo
    {
        return $this->belongsTo(NotificationChannel::class, 'channel_id');
    }
}