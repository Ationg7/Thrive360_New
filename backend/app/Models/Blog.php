<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'category',
        'author_name',
        'author_email',
        'image_url',
        'excerpt',
        'tags'
    ];

    protected $casts = [
        'tags' => 'array',
    ];

    // Scope for filtering by category
    public function scopeByCategory($query, $category)
    {
        if ($category && $category !== 'all') {
            return $query->where('category', $category);
        }
        return $query;
    }

    // Get excerpt from content if not provided - only when reading, not when saving
    public function getExcerptAttribute($value)
    {
        // Return the actual saved excerpt if it exists and is not empty
        if ($value !== null && $value !== '') {
            return $value;
        }
        // Only generate from content if excerpt is null or empty in database
        if (isset($this->attributes['content']) && !empty($this->attributes['content'])) {
            return substr(strip_tags($this->attributes['content']), 0, 150) . '...';
        }
        return $value;
    }
}
