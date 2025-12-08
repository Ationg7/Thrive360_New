<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Services\FcmService;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'is_read',
        'read_at'
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    // Helper methods
    public function markAsRead()
    {
        $this->update([
            'is_read' => true,
            'read_at' => now()
        ]);
    }

    // Static method to create notifications
    public static function createNotification($userId, $type, $title, $message, $data = null)
    {
        $notification = self::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data
        ]);

        // Also send a push notification via FCM (if configured)
        try {
            /** @var FcmService $fcm */
            $fcm = app(FcmService::class);
            $fcm->sendToUser($userId, $title, $message, is_array($data) ? $data : []);
        } catch (\Throwable $e) {
            // Avoid breaking app flow if push sending fails
            \Log::error('Failed to send FCM push notification', [
                'error' => $e->getMessage(),
            ]);
        }

        return $notification;
    }
}
