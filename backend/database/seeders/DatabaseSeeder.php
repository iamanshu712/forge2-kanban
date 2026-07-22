<?php

namespace Database\Seeders;

use App\Models\Board;
use App\Models\Column;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Demo user
        $user = User::firstOrCreate(
            ['email' => 'demo@forgekanban.com'],
            [
                'name'     => 'Demo User',
                'password' => Hash::make('password'),
            ]
        );

        // Demo board
        $board = Board::create([
            'user_id'     => $user->id,
            'name'        => 'Product Roadmap',
            'description' => 'Forge 2 Qualifier Demo Board',
            'color'       => '#6366f1',
        ]);

        $columnData = [
            ['name' => 'Backlog',     'tasks' => ['Define requirements', 'Research competitors', 'Write specs']],
            ['name' => 'In Progress', 'tasks' => ['Build auth module', 'Design kanban UI']],
            ['name' => 'Review',      'tasks' => ['Code review PR #12']],
            ['name' => 'Done',        'tasks' => ['Project setup', 'DB migrations', 'API routing']],
        ];

        foreach ($columnData as $colPos => $col) {
            $column = Column::create([
                'board_id' => $board->id,
                'name'     => $col['name'],
                'position' => $colPos,
            ]);

            foreach ($col['tasks'] as $taskPos => $title) {
                Task::create([
                    'column_id' => $column->id,
                    'title'     => $title,
                    'position'  => $taskPos,
                    'priority'  => ['low', 'medium', 'high'][$taskPos % 3],
                ]);
            }
        }
    }
}
