<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    use HasFactory;

    protected $fillable = [
        'board_list_id', 'title', 'description', 'position', 'due_date', 'member_id',
    ];

    protected $casts = [
        'due_date' => 'date',
    ];

    protected $appends = ['is_overdue'];

    public function list()
    {
        return $this->belongsTo(BoardList::class, 'board_list_id');
    }

    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'card_tag');
    }

    public function getIsOverdueAttribute(): bool
    {
        if (! $this->due_date) {
            return false;
        }

        return $this->due_date->isPast() && ! $this->due_date->isToday();
    }
}
