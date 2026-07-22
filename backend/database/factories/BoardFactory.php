<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BoardFactory extends Factory
{
    public function definition(): array
    {
        $colors = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f97316','#22c55e','#06b6d4'];
        return [
            'user_id'     => User::factory(),
            'name'        => fake()->words(3, true),
            'description' => fake()->optional()->sentence(),
            'color'       => fake()->randomElement($colors),
        ];
    }
}
