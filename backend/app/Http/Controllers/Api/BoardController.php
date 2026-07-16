<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use Illuminate\Http\Request;

class BoardController extends Controller
{
    public function index()
    {
        return Board::withCount('lists')->orderByDesc('id')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $board = Board::create($data);

        // Give every new board a sensible default set of lists.
        foreach (['To Do', 'Doing', 'Done'] as $i => $name) {
            $board->lists()->create(['name' => $name, 'position' => $i]);
        }

        return response()->json($board->load('lists.cards', 'members', 'tags'), 201);
    }

    public function show(Board $board)
    {
        return $board->load([
            'lists.cards.tags',
            'lists.cards.member',
            'members',
            'tags',
        ]);
    }

    public function update(Request $request, Board $board)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $board->update($data);

        return $board;
    }

    public function destroy(Board $board)
    {
        $board->delete();

        return response()->noContent();
    }
}
