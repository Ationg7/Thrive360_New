<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Challenge extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'category',
        'status',
        'participants',
        'progress_percentage',
        'start_date',
        'end_date',
        'theme',
        'is_active',
        'user_id'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'participants' => 'integer',
        'progress_percentage' => 'integer',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

   public function participantsList()
    {
    return $this->hasMany(UserChallengeProgress::class);
    }


    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function incrementParticipants()
    {
        $this->increment('participants');
    }

    public function decrementParticipants()
    {
        $this->decrement('participants');
    }
}
