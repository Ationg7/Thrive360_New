<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class PasswordResetCode extends Model
{
    protected $fillable = [
        'email',
        'code',
        'is_used',
        'expires_at',
        'used_at'
    ];

    protected $casts = [
        'is_used' => 'boolean',
        'expires_at' => 'datetime',
        'used_at' => 'datetime'
    ];

    /**
     * Generate a 6-digit random code
     */
    public static function generateCode()
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Create a new password reset code for the given email
     */
    public static function createForEmail($email)
    {
        // Mark any existing codes for this email as used
        self::where('email', $email)
            ->where('is_used', false)
            ->update(['is_used' => true, 'used_at' => now()]);

        // Create new code
        return self::create([
            'email' => $email,
            'code' => self::generateCode(),
            'expires_at' => now()->addHours(1), // Code expires in 1 hour
        ]);
    }

    /**
     * Verify if a code is valid for the given email
     */
    public static function verifyCode($email, $code)
    {
        $resetCode = self::where('email', $email)
            ->where('code', $code)
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->first();

        if ($resetCode) {
            // Mark as used
            $resetCode->update([
                'is_used' => true,
                'used_at' => now()
            ]);
            return true;
        }

        return false;
    }

    /**
     * Check if a code is valid for the given email (without marking as used)
     */
    public static function isValidCode($email, $code)
    {
        \Log::info('Checking isValidCode', [
            'email' => $email,
            'code' => $code,
            'now' => now()
        ]);

        $result = self::where('email', $email)
            ->where('code', $code)
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->exists();

        \Log::info('isValidCode result', [
            'email' => $email,
            'code' => $code,
            'result' => $result
        ]);

        return $result;
    }

    /**
     * Check if there are any pending reset requests for an email
     */
    public static function hasPendingRequest($email)
    {
        return self::where('email', $email)
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->where('code', '!=', 'PENDING')
            ->exists();
    }

    /**
     * Check if there are any pending requests (including PENDING status)
     */
    public static function hasAnyPendingRequest($email)
    {
        return self::where('email', $email)
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->exists();
    }

    /**
     * Get the latest pending code for an email
     */
    public static function getLatestPendingCode($email)
    {
        return self::where('email', $email)
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();
    }

    /**
     * Clean up expired codes
     */
    public static function cleanupExpired()
    {
        return self::where('expires_at', '<', now())->delete();
    }

    /**
     * Relationship to User model
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'email', 'email');
    }
}
