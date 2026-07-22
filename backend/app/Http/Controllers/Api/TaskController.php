<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Column;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function store(Request $request, Column $column)
    {
        $this->authorize('update', $column->board);

        $data = $request->validate([
            'title'       => ['required', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'due_date'    => ['nullable', 'date'],
            'priority'    => ['nullable', 'in:low,medium,high'],
        ]);

        $maxPos = $column->tasks()->max('position');
        $data['position']  = $maxPos !== null ? $maxPos + 1 : 0;
        $data['column_id'] = $column->id;

        $task = Task::create($data);

        return response()->json($task, 201);
    }

    public function show(Request $request, Task $task)
    {
        $this->authorize('view', $task->column->board);

        return response()->json($task);
    }

    public function update(Request $request, Task $task)
    {
        $this->authorize('update', $task->column->board);

        $data = $request->validate([
            'title'       => ['sometimes', 'required', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'due_date'    => ['nullable', 'date'],
            'priority'    => ['nullable', 'in:low,medium,high'],
        ]);

        $task->update($data);

        return response()->json($task);
    }

    public function destroy(Request $request, Task $task)
    {
        $this->authorize('update', $task->column->board);

        $task->delete();

        return response()->noContent();
    }

    /**
     * Move a task to a different column and/or position.
     * Handles cross-column drag-and-drop.
     */
    public function move(Request $request, Task $task)
    {
        $this->authorize('update', $task->column->board);

        $data = $request->validate([
            'column_id' => ['required', 'integer', 'exists:columns,id'],
            'position'  => ['required', 'integer', 'min:0'],
        ]);

        // Verify target column belongs to same board
        $targetColumn = Column::findOrFail($data['column_id']);
        if ($targetColumn->board_id !== $task->column->board_id) {
            return response()->json(['message' => 'Target column is not on the same board.'], 403);
        }

        $task->update([
            'column_id' => $data['column_id'],
            'position'  => $data['position'],
        ]);

        return response()->json($task);
    }
}
