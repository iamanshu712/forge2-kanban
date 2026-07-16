<?php

use App\Http\Controllers\Api\BoardController;
use App\Http\Controllers\Api\BoardListController;
use App\Http\Controllers\Api\CardController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\TagController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Kanban API — tiny Trello-style board
|--------------------------------------------------------------------------
| Boards -> Lists -> Cards, with tags, member assignment, and due dates.
*/

Route::get('/boards', [BoardController::class, 'index']);
Route::post('/boards', [BoardController::class, 'store']);
Route::get('/boards/{board}', [BoardController::class, 'show']);
Route::put('/boards/{board}', [BoardController::class, 'update']);
Route::delete('/boards/{board}', [BoardController::class, 'destroy']);

Route::post('/boards/{board}/lists', [BoardListController::class, 'store']);
Route::put('/lists/{list}', [BoardListController::class, 'update']);
Route::delete('/lists/{list}', [BoardListController::class, 'destroy']);

Route::post('/lists/{list}/cards', [CardController::class, 'store']);
Route::put('/cards/{card}', [CardController::class, 'update']);
Route::patch('/cards/{card}/move', [CardController::class, 'move']);
Route::post('/cards/{card}/tags', [CardController::class, 'attachTag']);
Route::delete('/cards/{card}/tags/{tagId}', [CardController::class, 'detachTag']);
Route::delete('/cards/{card}', [CardController::class, 'destroy']);

Route::post('/boards/{board}/tags', [TagController::class, 'store']);
Route::delete('/tags/{tag}', [TagController::class, 'destroy']);

Route::post('/boards/{board}/members', [MemberController::class, 'store']);
Route::delete('/members/{member}', [MemberController::class, 'destroy']);
