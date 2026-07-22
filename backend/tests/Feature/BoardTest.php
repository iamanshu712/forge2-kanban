<?php

namespace Tests\Feature;

use App\Models\Board;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BoardTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsUser(): array
    {
        $user  = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;
        return [$user, $token];
    }

    public function test_user_can_list_boards(): void
    {
        [$user, $token] = $this->actingAsUser();
        Board::factory()->count(3)->create(['user_id' => $user->id]);

        $this->withToken($token)->getJson('/api/boards')
            ->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_user_can_create_board(): void
    {
        [, $token] = $this->actingAsUser();

        $this->withToken($token)->postJson('/api/boards', [
            'name'  => 'My Board',
            'color' => '#6366f1',
        ])->assertStatus(201)->assertJsonPath('name', 'My Board');
    }

    public function test_user_can_update_own_board(): void
    {
        [$user, $token] = $this->actingAsUser();
        $board = Board::factory()->create(['user_id' => $user->id]);

        $this->withToken($token)->putJson("/api/boards/{$board->id}", [
            'name' => 'Updated Name',
        ])->assertStatus(200)->assertJsonPath('name', 'Updated Name');
    }

    public function test_user_cannot_update_other_users_board(): void
    {
        [, $token]     = $this->actingAsUser();
        $otherUser     = User::factory()->create();
        $otherBoard    = Board::factory()->create(['user_id' => $otherUser->id]);

        $this->withToken($token)->putJson("/api/boards/{$otherBoard->id}", [
            'name' => 'Hacked',
        ])->assertStatus(403);
    }

    public function test_user_can_delete_own_board(): void
    {
        [$user, $token] = $this->actingAsUser();
        $board = Board::factory()->create(['user_id' => $user->id]);

        $this->withToken($token)->deleteJson("/api/boards/{$board->id}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('boards', ['id' => $board->id]);
    }
}
