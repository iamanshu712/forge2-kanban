<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BoardList;
use App\Models\Card;
use Illuminate\Http\Request;

class CardController extends Controller
{
    public function store(Request $request, BoardList $list)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'member_id' => 'nullable|exists:members,id',
        ]);

        $position = $list->cards()->max('position') + 1;

        $card = $list->cards()->create([...$data, 'position' => $position]);

        return response()->json($card->load('tags', 'member'), 201);
    }

    public function update(Request $request, Card $card)
    {
        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
            'member_id' => 'nullable|exists:members,id',
        ]);

        $card->update($data);

        return $card->load('tags', 'member');
    }

    /**
     * Move a card to a (possibly different) list and position.
     * This is the endpoint the drag-and-drop / "move card" UI action hits.
     */
    public function move(Request $request, Card $card)
    {
        $data = $request->validate([
            'board_list_id' => 'required|exists:board_lists,id',
            'position' => 'required|integer|min:0',
        ]);

        $card->update($data);

        return $card->load('tags', 'member', 'list');
    }

    public function attachTag(Request $request, Card $card)
    {
        $data = $request->validate(['tag_id' => 'required|exists:tags,id']);
        $card->tags()->syncWithoutDetaching([$data['tag_id']]);

        return $card->load('tags');
    }

    public function detachTag(Card $card, int $tagId)
    {
        $card->tags()->detach($tagId);

        return $card->load('tags');
    }

    public function destroy(Card $card)
    {
        $card->delete();

        return response()->noContent();
    }
}
