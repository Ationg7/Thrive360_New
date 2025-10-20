<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
        'avatar_url',
        'profile_cover_url',
        'restricted_until',
        'restriction_reason',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'restricted_until' => 'datetime',
        ];
    }

    // Helper methods for role checking
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isUser()
    {
        return $this->role === 'user';
    }

    // Check if user is currently restricted
    public function isRestricted()
    {
        return $this->restricted_until && $this->restricted_until > now();
    }

    // Get restriction info
    public function getRestrictionInfo()
    {
        if (!$this->isRestricted()) {
            return null;
        }

        return [
            'restricted_until' => $this->restricted_until,
            'restriction_reason' => $this->restriction_reason,
            'days_remaining' => now()->diffInDays($this->restricted_until, false)
        ];
    }

    // New relationships
    public function savedPosts()
    {
        return $this->belongsToMany(FreedomWallPost::class, 'saved_posts', 'user_id', 'post_id')
                    ->withTimestamps();
    }

    public function todos()
    {
        return $this->hasMany(Todo::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function unreadNotifications()
    {
        return $this->notifications()->unread();
    }

    public function challengeProgress()
    {
        return $this->hasMany(UserChallengeProgress::class);
    }

    public function events()
    {
        return $this->belongsToMany(Event::class, 'event_participants')
                    ->withTimestamps();
    }

    public function passwordResetCodes()
    {
        return $this->hasMany(PasswordResetCode::class, 'email', 'email');
    }
}
