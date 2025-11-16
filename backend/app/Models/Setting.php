<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];
    
    public $timestamps = true;
    
    // Boolean setting keys
    protected static $booleanKeys = [
        'maintenance_mode',
        'allow_registration',
        'email_notifications',
        'auto_backup'
    ];
    
    /**
     * Get a setting value by key
     */
    public static function getValue($key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        if (!$setting) {
            return $default;
        }
        
        // Convert boolean keys to actual booleans
        if (in_array($key, self::$booleanKeys)) {
            return self::stringToBoolean($setting->value);
        }
        
        return $setting->value;
    }
    
    /**
     * Set a setting value by key
     */
    public static function setValue($key, $value)
    {
        // Convert boolean values to string for storage
        if (in_array($key, self::$booleanKeys)) {
            $value = self::booleanToString($value);
        } else {
            $value = (string)$value;
        }
        
        $result = self::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
        
        // Log for debugging
        \Log::info("Setting saved: {$key} = {$value} (stored as: " . $result->value . ")");
        
        return $result;
    }
    
    /**
     * Get all settings as key-value array
     */
    public static function getAll()
    {
        $settings = self::pluck('value', 'key')->toArray();
        
        // Convert boolean keys to actual booleans
        foreach (self::$booleanKeys as $key) {
            if (isset($settings[$key])) {
                $settings[$key] = self::stringToBoolean($settings[$key]);
            }
        }
        
        return $settings;
    }
    
    /**
     * Convert string to boolean
     */
    private static function stringToBoolean($value)
    {
        if (is_bool($value)) {
            return $value;
        }
        if (is_string($value)) {
            $normalized = strtolower(trim($value));
            return in_array($normalized, ['true', '1', 'on', 'yes']);
        }
        return (bool)$value;
    }
    
    /**
     * Convert boolean to string
     */
    private static function booleanToString($value)
    {
        if (is_bool($value)) {
            return $value ? 'true' : 'false';
        }
        if (is_string($value)) {
            $normalized = strtolower(trim($value));
            if (in_array($normalized, ['true', '1', 'on', 'yes'])) {
                return 'true';
            }
            if (in_array($normalized, ['false', '0', 'off', 'no', ''])) {
                return 'false';
            }
            return $value;
        }
        if ($value === 1 || $value === '1') {
            return 'true';
        }
        if ($value === 0 || $value === '0' || $value === null) {
            return 'false';
        }
        return (string)$value;
    }
}
