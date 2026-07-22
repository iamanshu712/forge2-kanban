<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use Illuminate\Http\Request;

class BoardController extends Controller
{
    public function index(Request $request)
    {
        $boards = $request->user()
            ->boards()
            ->withCount('columns')
            ->latest()
            ->get();

        return response()->json($boards);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'color'       => ['nullable', 'string', 'max:20'],
        ]);

        $board = $request->user()->boards()->create($data);

        return response()->json($board, 201);
    }

    public function show(Request $request, Board $board)
    {
        $this->authorize('view', $board);

        $board->load(['columns' => function ($q) {
            $q->orderBy('position')->with(['tasks' => function ($q2) {
                $q2->orderBy('position');
            }]);
        }]);

        return response()->json($board);
    }

    public function update(Request $request, Board $board)
    {
        $this->authorize('update', $board);

        $data = $request->validate([
            'name'        => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'color'       => ['nullable', 'string', 'max:20'],
        ]);

        $board->update($data);

        return response()->json($board);
    }

    public function destroy(Request $request, Board $board)
    {
        $this->authorize('delete', $board);

        $board->delete();

        return response()->noContent();
    }
}
