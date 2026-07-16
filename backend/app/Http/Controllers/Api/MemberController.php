<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\Member;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    public function store(Request $request, Board $board)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'color' => 'nullable|string|max:7',
        ]);

        $member = $board->members()->create($data);

        return response()->json($member, 201);
    }

    public function destroy(Member $member)
    {
        $member->delete();

        return response()->noContent();
    }
}
