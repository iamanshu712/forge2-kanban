<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BoardController;
use App\Http\Controllers\Api\ColumnController;
use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Forge Kanban API Routes
|--------------------------------------------------------------------------
| Auth: Sanctum token-based (stateless)
| All board/column/task routes protected by auth:sanctum middleware
*/

// ── Public auth routes ─────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// ── Protected routes ───────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',    [AuthController::class, 'user']);

    // Boards
    Route::get('/boards',             [BoardController::class, 'index']);
    Route::post('/boards',            [BoardController::class, 'store']);
    Route::get('/boards/{board}',     [BoardController::class, 'show']);
    Route::put('/boards/{board}',     [BoardController::class, 'update']);
    Route::delete('/boards/{board}',  [BoardController::class, 'destroy']);

    // Columns (scoped under board for creation)
    Route::post('/boards/{board}/columns',  [ColumnController::class, 'store']);
    Route::put('/columns/{column}',         [ColumnController::class, 'update']);
    Route::delete('/columns/{column}',      [ColumnController::class, 'destroy']);
    Route::patch('/columns/{column}/reorder', [ColumnController::class, 'reorder']);

    // Tasks (scoped under column for creation)
    Route::post('/columns/{column}/tasks', [TaskController::class, 'store']);
    Route::get('/tasks/{task}',            [TaskController::class, 'show']);
    Route::put('/tasks/{task}',            [TaskController::class, 'update']);
    Route::delete('/tasks/{task}',         [TaskController::class, 'destroy']);
    Route::patch('/tasks/{task}/move',     [TaskController::class, 'move']);
});
