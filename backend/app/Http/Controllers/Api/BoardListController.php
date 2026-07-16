<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\BoardList;
use Illuminate\Http\Request;

class BoardListController extends Controller
{
    public function store(Request $request, Board $board)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $position = $board->lists()->max('position') + 1;

        $list = $board->lists()->create([
            'name' => $data['name'],
            'position' => $position,
        ]);

        return response()->json($list, 201);
    }

    public function update(Request $request, BoardList $list)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'position' => 'sometimes|integer|min:0',
        ]);

        $list->update($data);

        return $list;
    }

    public function destroy(BoardList $list)
    {
        $list->delete();

        return response()->noContent();
    }
}
