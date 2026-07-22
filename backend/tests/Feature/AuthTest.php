<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name'                  => 'Test User',
            'email'                 => 'test@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['user' => ['id', 'name', 'email'], 'token']);
    }

    public function test_user_cannot_register_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'test@example.com']);

        $response = $this->postJson('/api/register', [
            'name'                  => 'Another User',
            'email'                 => 'test@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(422);
    }

    public function test_user_can_login(): void
    {
        $user = User::factory()->create(['password' => bcrypt('password123')]);

        $response = $this->postJson('/api/login', [
            'email'    => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['user', 'token']);
    }

    public function test_user_cannot_login_with_wrong_password(): void
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/login', [
            'email'    => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401);
    }

    public function test_user_can_logout(): void
    {
        $user  = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/logout');

        $response->assertStatus(200);
    }

    public function test_unauthenticated_request_returns_401(): void
    {
        $this->getJson('/api/boards')->assertStatus(401);
    }
}
