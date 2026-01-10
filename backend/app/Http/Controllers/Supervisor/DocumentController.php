<?php

namespace App\Http\Controllers\Supervisor;

use App\Http\Controllers\Controller;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use App\Models\Project;
use App\Services\DocumentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    public function __construct(
        protected DocumentService $documentService
    ) {}

    /**
     * Review a document (approve or reject)
     */
    public function review(Request $request, Project $project, Document $document): JsonResponse
    {
        // Verify the supervisor is assigned to this project
        if ($project->supervisor_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You are not the supervisor of this project',
            ], 403);
        }

        // Verify the document belongs to this project
        if ($document->project_id !== $project->id) {
            return response()->json([
                'success' => false,
                'message' => 'Document does not belong to this project',
            ], 400);
        }

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'comments' => 'nullable|string|max:5000',
        ]);

        try {
            $reviewedDocument = $this->documentService->review(
                $document,
                $request->user(),
                $validated['status'],
                $validated['comments'] ?? null
            );

            return response()->json([
                'success' => true,
                'data' => new DocumentResource($reviewedDocument->load(['project', 'submitter', 'reviewer'])),
                'message' => 'Document reviewed successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Download a document
     */
    public function download(Request $request, Project $project, Document $document): JsonResponse|\Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        // Verify the supervisor is assigned to this project
        if ($project->supervisor_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - You are not the supervisor of this project',
            ], 403);
        }

        // Verify the document belongs to this project
        if ($document->project_id !== $project->id) {
            return response()->json([
                'success' => false,
                'message' => 'Document does not belong to this project',
            ], 400);
        }

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
