<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\Column;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;

class AgentController extends Controller
{
    /**
     * Get workspace context for Hermes & OpenClaw AI agent.
     */
    public function context(Request $request)
    {
        $user = $request->user();
        $boards = Board::where('user_id', $user->id)
            ->with(['columns.tasks.assignee'])
            ->get();

        $users = User::select('id', 'name', 'email')->get();

        return response()->json([
            'user'   => $user->only(['id', 'name', 'email']),
            'boards' => $boards,
            'users'  => $users,
        ]);
    }

    /**
     * Helper endpoint to resolve/assign user to task by email or name.
     */
    public function assign(Request $request, Task $task)
    {
        $this->authorize('update', $task->column->board);

        $request->validate([
            'email' => ['nullable', 'string', 'email'],
            'name'  => ['nullable', 'string'],
        ]);

        $query = User::query();
        if ($request->filled('email')) {
            $query->where('email', $request->input('email'));
        } elseif ($request->filled('name')) {
            $query->where('name', 'like', '%' . $request->input('name') . '%');
        } else {
            return response()->json(['message' => 'Email or name required.'], 422);
        }

        $user = $query->first();
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 44);
        }

        $task->update(['assigned_to' => $user->id]);

        return response()->json([
            'message' => 'Task assigned successfully.',
            'task'    => $task->fresh('assignee'),
        ]);
    }
}
