<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Board extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description'];

    public function lists()
    {
        return $this->hasMany(BoardList::class)->orderBy('position');
    }

    public function members()
    {
        return $this->hasMany(Member::class);
    }

    public function tags()
    {
        return $this->hasMany(Tag::class);
    }
}
