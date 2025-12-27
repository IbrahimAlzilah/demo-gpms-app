<?php

namespace App\Http\Controllers\Supervisor;

use App\Http\Controllers\Controller;
use App\Models\SupervisorNote;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    public function index(Request $request, Project $project): JsonResponse
    {
        if ($project->supervisor_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $notes = SupervisorNote::where('project_id', $project->id)
            ->with(['supervisor', 'replies.author'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notes,
        ]);
    }

    public function store(Request $request, Project $project): JsonResponse
    {
        if ($project->supervisor_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $note = SupervisorNote::create([
            'project_id' => $project->id,
            'supervisor_id' => $request->user()->id,
            'content' => $validated['content'],
        ]);

        return response()->json([
            'success' => true,
            'data' => $note->load(['supervisor', 'replies']),
            'message' => 'Note added successfully',
        ], 201);
    }

    public function addReply(Request $request, SupervisorNote $note): JsonResponse
    {
        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $reply = \App\Models\NoteReply::create([
            'note_id' => $note->id,
            'author_id' => $request->user()->id,
            'content' => $validated['content'],
        ]);

        return response()->json([
            'success' => true,
            'data' => $reply->load(['author']),
            'message' => 'Reply added successfully',
        ], 201);
    }
}

