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

      protected $appends = ['excerpt']; // <-- add this line delete if sayup sya ako ra gi experement

    // Scope for filtering by category
    public function scopeByCategory($query, $category)
    {
        if ($category && $category !== 'all') {
            return $query->where('category', $category);
        }
        return $query;
    }

    // Get excerpt from content if not provided
    public function getExcerptAttribute($value)
    {
        if ($value) {
            return $value;
        }
        return substr(strip_tags($this->content), 0, 150) . '...';
    }
}
