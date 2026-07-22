<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'column_id',
        'title',
        'description',
        'position',
        'due_date',
        'priority',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date:Y-m-d',
        ];
    }

    public function column()
    {
        return $this->belongsTo(Column::class);
    }
}
