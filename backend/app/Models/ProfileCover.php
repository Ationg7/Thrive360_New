<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfileCover extends Model
{
    use HasFactory;

    protected $fillable = [
        'path',
        'url',
        'uploaded_by',
    ];
}


