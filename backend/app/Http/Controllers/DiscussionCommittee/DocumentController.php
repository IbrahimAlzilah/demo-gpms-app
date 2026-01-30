<?php

namespace App\Http\Controllers\DiscussionCommittee;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DocumentController extends Controller
{
    /**
     * Download a document (read-only access for discussion committee).
     * Authorized for committee members assigned to the project.
     */
    public function download(Request $request, Project $project, Document $document): JsonResponse|BinaryFileResponse
    {
        $isAssigned = $project->committeeMembers()->where('users.id', $request->user()->id)->exists();

        if (!$isAssigned) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You are not assigned to this project',
            ], 403);
        }

        if ($document->project_id !== $project->id) {
            return response()->json([
                'success' => false,
                'message' => 'Document does not belong to this project',
            ], 400);
        }

        $this->authorize('view', $document);

        $filePath = storage_path('app/documents/' . $document->file_path);

        if (!file_exists($filePath)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], 404);
        }

        return response()->download($filePath, $document->file_name);
    }
}
