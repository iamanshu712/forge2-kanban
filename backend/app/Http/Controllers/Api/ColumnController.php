<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\Column;
use Illuminate\Http\Request;

class ColumnController extends Controller
{
    public function store(Request $request, Board $board)
    {
        $this->authorize('update', $board);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $maxPos = $board->columns()->max('position');
        $data['position'] = $maxPos !== null ? $maxPos + 1 : 0;
        $data['board_id'] = $board->id;

        $column = Column::create($data);
        $column->load('tasks');

        return response()->json($column, 201);
    }

    public function update(Request $request, Column $column)
    {
        $this->authorize('update', $column->board);

        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
        ]);

        $column->update($data);

        return response()->json($column);
    }

    public function destroy(Request $request, Column $column)
    {
        $this->authorize('update', $column->board);

        $column->delete();

        return response()->noContent();
    }

    public function reorder(Request $request, Column $column)
    {
        $this->authorize('update', $column->board);

        $data = $request->validate([
            'position' => ['required', 'integer', 'min:0'],
        ]);

        $column->update(['position' => $data['position']]);

        return response()->json($column);
    }
}
