<?php

namespace Tests\Feature;

use App\Models\Board;
use App\Models\Column;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ColumnTest extends TestCase
{
    use RefreshDatabase;

    private function setup_board(): array
    {
        $user  = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        $board = Board::factory()->create(['user_id' => $user->id]);
        return [$user, $token, $board];
    }

    public function test_user_can_create_column(): void
    {
        [, $token, $board] = $this->setup_board();

        $this->withToken($token)->postJson("/api/boards/{$board->id}/columns", [
            'name' => 'To Do',
        ])->assertStatus(201)->assertJsonPath('name', 'To Do');
    }

    public function test_user_can_rename_column(): void
    {
        [$user, $token, $board] = $this->setup_board();
        $col = Column::create(['board_id' => $board->id, 'name' => 'Old', 'position' => 0]);

        $this->withToken($token)->putJson("/api/columns/{$col->id}", [
            'name' => 'New Name',
        ])->assertStatus(200)->assertJsonPath('name', 'New Name');
    }

    public function test_user_can_delete_column(): void
    {
        [$user, $token, $board] = $this->setup_board();
        $col = Column::create(['board_id' => $board->id, 'name' => 'Temp', 'position' => 0]);

        $this->withToken($token)->deleteJson("/api/columns/{$col->id}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('columns', ['id' => $col->id]);
    }
}

class TaskTest extends TestCase
{
    use RefreshDatabase;

    private function setup_column(): array
    {
        $user   = User::factory()->create();
        $token  = $user->createToken('test')->plainTextToken;
        $board  = Board::factory()->create(['user_id' => $user->id]);
        $column = Column::create(['board_id' => $board->id, 'name' => 'To Do', 'position' => 0]);
        return [$user, $token, $board, $column];
    }

    public function test_user_can_create_task(): void
    {
        [, $token, , $column] = $this->setup_column();

        $this->withToken($token)->postJson("/api/columns/{$column->id}/tasks", [
            'title'    => 'Fix the bug',
            'priority' => 'high',
        ])->assertStatus(201)->assertJsonPath('title', 'Fix the bug');
    }

    public function test_user_can_update_task(): void
    {
        [, $token, , $column] = $this->setup_column();
        $task = Task::create(['column_id' => $column->id, 'title' => 'Old title', 'position' => 0]);

        $this->withToken($token)->putJson("/api/tasks/{$task->id}", [
            'title' => 'New title',
        ])->assertStatus(200)->assertJsonPath('title', 'New title');
    }

    public function test_user_can_move_task_between_columns(): void
    {
        [$user, $token, $board, $col1] = $this->setup_column();
        $col2 = Column::create(['board_id' => $board->id, 'name' => 'Done', 'position' => 1]);
        $task = Task::create(['column_id' => $col1->id, 'title' => 'Task', 'position' => 0]);

        $this->withToken($token)->patchJson("/api/tasks/{$task->id}/move", [
            'column_id' => $col2->id,
            'position'  => 0,
        ])->assertStatus(200)->assertJsonPath('column_id', $col2->id);
    }

    public function test_user_can_delete_task(): void
    {
        [, $token, , $column] = $this->setup_column();
        $task = Task::create(['column_id' => $column->id, 'title' => 'Delete me', 'position' => 0]);

        $this->withToken($token)->deleteJson("/api/tasks/{$task->id}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }
}
