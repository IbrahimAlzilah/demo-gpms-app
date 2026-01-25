<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\DocumentResource;
use App\Http\Traits\HasTableQuery;
use App\Models\Document;
use App\Services\DocumentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    use HasTableQuery;

    public function __construct(
        protected DocumentService $documentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        // Get all documents for projects where the student is registered
        $studentProjects = \App\Models\Project::whereHas('students', function ($q) use ($request) {
            $q->where('users.id', $request->user()->id);
        })->pluck('id');

        $query = Document::whereIn('project_id', $studentProjects)
            ->with(['project', 'submitter', 'reviewer']);

        if ($request->has('project_id')) {
            // Verify student is registered in the requested project
            if (!$studentProjects->contains($request->project_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized - You are not registered in this project',
                ], 403);
            }
            $query->where('project_id', $request->project_id);
        }

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request, DocumentResource::class));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'file' => 'required|file|max:10240', // 10MB max
            'type' => 'required|in:proposal,chapters,final_report,code,presentation,other',
        ]);

        try {
            $project = \App\Models\Project::findOrFail($validated['project_id']);
            $user = $request->user();
            
            // UC-ST-06: Verify student is registered in the project
            $isRegistered = $project->students()->where('users.id', $user->id)->exists();
            if (!$isRegistered) {
                return response()->json([
                    'success' => false,
                    'message' => 'You must be registered in this project to upload documents',
                ], 403);
            }

            // Check if document submission window is active (students restricted by this window)
            $timeWindowService = app(\App\Services\TimeWindowService::class);
            $isWindowActive = $timeWindowService->isWindowActive(\App\Enums\TimePeriodType::FINAL_PROJECT_DOCUMENT_SUBMISSION)
                || $timeWindowService->isWindowActive(\App\Enums\TimePeriodType::CHAPTER_SUBMISSION_PHASE_1)
                || $timeWindowService->isWindowActive(\App\Enums\TimePeriodType::CHAPTER_SUBMISSION_PHASE_2);
            
            if (!$isWindowActive) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document submission is only allowed during chapters submission or final document submission periods',
                ], 403);
            }
            
            $document = $this->documentService->upload(
                $project,
                $request->file('file'),
                $validated['type'],
                $user
            );

            return response()->json([
                'success' => true,
                'data' => new DocumentResource($document->load(['project', 'submitter'])),
                'message' => 'Document uploaded successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function show(Document $document): JsonResponse
    {
        $this->authorize('view', $document);

        return response()->json([
            'success' => true,
            'data' => new DocumentResource($document->load(['project', 'submitter', 'reviewer'])),
        ]);
    }

    public function download(Document $document)
    {
        $this->authorize('view', $document);

        $filePath = $document->file_path;
        $disk = \Storage::disk('documents');

        if (!$disk->exists($filePath)) {
            abort(404, 'File not found');
        }

        return $disk->download($filePath, $document->file_name);
    }

    public function destroy(Document $document): JsonResponse
    {
        $this->authorize('delete', $document);

        try {
            $this->documentService->delete($document);

            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    protected function applySearch($query, string $search)
    {
        return $query->where('file_name', 'like', "%{$search}%");
    }

    protected function applyFilters($query, array $filters)
    {
        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        if (isset($filters['review_status'])) {
            $query->where('review_status', $filters['review_status']);
        }
        return $query;
    }
}

