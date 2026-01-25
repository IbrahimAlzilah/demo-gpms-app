<?php

namespace App\Http\Controllers\ProjectsCommittee;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProposalResource;
use App\Http\Resources\ProposalSubmissionResource;
use App\Http\Traits\HasTableQuery;
use App\Models\Proposal;
use App\Services\ProposalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProposalController extends Controller
{
    use HasTableQuery;

    public function __construct(
        protected ProposalService $proposalService
    ) {}

    /**
     * Search students for proposal submission
     */
    public function searchStudents(Request $request): JsonResponse
    {
        $search = $request->input('query');
        
        $students = \App\Models\User::where('role', 'student')
            ->where('status', 'active')
            ->when($search, function ($q) use ($search) {
                return $q->where(function ($subQ) use ($search) {
                    $subQ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('university_id', 'like', "%{$search}%");
                });
            })
            ->limit(20)
            ->get(['id', 'name', 'email', 'university_id']);

        return response()->json([
            'success' => true,
            'data' => $students,
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Proposal::with(['submitter', 'reviewer', 'project', 'studentGroup', 'targetProject']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request, ProposalResource::class));
    }

    /**
     * Get proposals grouped by submission (student groups or supervisors)
     * Returns paginated submissions, each containing all proposals from that group/supervisor
     */
    public function submissions(Request $request): JsonResponse
    {
        $page = (int) $request->get('page', 1);
        $pageSize = (int) $request->get('pageSize', 10);
        $status = $request->get('status');
        $search = $request->get('search');

        // Base query for proposals
        $proposalsQuery = Proposal::query()
            ->with(['submitter', 'reviewer', 'project', 'studentGroup.leader', 'studentGroup.members', 'targetProject']);

        // Apply status filter
        if ($status && $status !== 'all') {
            $proposalsQuery->where('status', $status);
        }

        // Apply search filter (search in title and description)
        if ($search) {
            $proposalsQuery->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Get all proposals matching filters (we'll group them)
        $allProposals = $proposalsQuery->get();

        // Group proposals by origin
        $groupedSubmissions = [];
        
        // Group 1: Student groups (by student_group_id)
        $studentGroupProposals = $allProposals->whereNotNull('student_group_id')
            ->groupBy('student_group_id');
        
        foreach ($studentGroupProposals as $groupId => $proposals) {
            $firstProposal = $proposals->first();
            $statuses = $proposals->pluck('status')->unique();
            $status = $statuses->count() === 1 ? $statuses->first() : 'mixed';
            
            // Get the earliest and latest dates
            $minCreatedAt = $proposals->min('created_at');
            $maxUpdatedAt = $proposals->max('updated_at');
            
            $groupedSubmissions[] = [
                'id' => "group_{$groupId}",
                'origin' => 'student_group',
                'studentGroupId' => (string) $groupId,
                'studentGroup' => $firstProposal->studentGroup ?? null,
                'submitter' => $firstProposal->submitter ?? null,
                'proposals' => $proposals->sortBy('created_at')->values(),
                'status' => $status,
                'submittedAt' => $minCreatedAt ? $minCreatedAt->toISOString() : now()->toISOString(),
                'lastUpdatedAt' => $maxUpdatedAt ? $maxUpdatedAt->toISOString() : now()->toISOString(),
                'totalProposals' => $proposals->count(),
            ];
        }

        // Group 2: Supervisors (by submitter_id where role is supervisor)
        // Exclude proposals that belong to student groups (they're already grouped above)
        $supervisorProposals = $allProposals
            ->filter(function ($proposal) {
                return !$proposal->student_group_id 
                    && $proposal->submitter 
                    && $proposal->submitter->isSupervisor();
            })
            ->groupBy('submitter_id');
        
        foreach ($supervisorProposals as $submitterId => $proposals) {
            $firstProposal = $proposals->first();
            $statuses = $proposals->pluck('status')->unique();
            $status = $statuses->count() === 1 ? $statuses->first() : 'mixed';
            
            // Get the earliest and latest dates
            $minCreatedAt = $proposals->min('created_at');
            $maxUpdatedAt = $proposals->max('updated_at');
            
            $groupedSubmissions[] = [
                'id' => "supervisor_{$submitterId}",
                'origin' => 'supervisor',
                'supervisorId' => (string) $submitterId,
                'supervisor' => $firstProposal->submitter ?? null,
                'proposals' => $proposals->sortBy('created_at')->values(),
                'status' => $status,
                'submittedAt' => $minCreatedAt ? $minCreatedAt->toISOString() : now()->toISOString(),
                'lastUpdatedAt' => $maxUpdatedAt ? $maxUpdatedAt->toISOString() : now()->toISOString(),
                'totalProposals' => $proposals->count(),
            ];
        }

        // Group 3: Individual student proposals (no group, not supervisor)
        $individualProposals = $allProposals
            ->filter(function ($proposal) {
                return !$proposal->student_group_id 
                    && (!$proposal->submitter || !$proposal->submitter->isSupervisor());
            });
        
        foreach ($individualProposals as $proposal) {
            $groupedSubmissions[] = [
                'id' => "individual_{$proposal->id}",
                'origin' => 'student_group',
                'studentGroupId' => null,
                'studentGroup' => null,
                'submitter' => $proposal->submitter,
                'proposals' => collect([$proposal]),
                'status' => $proposal->status,
                'submittedAt' => $proposal->created_at->toISOString(),
                'lastUpdatedAt' => $proposal->updated_at->toISOString(),
                'totalProposals' => 1,
            ];
        }

        // Sort submissions by submittedAt (newest first)
        usort($groupedSubmissions, function ($a, $b) {
            return strcmp($b['submittedAt'], $a['submittedAt']);
        });

        // Paginate submissions
        $total = count($groupedSubmissions);
        $totalPages = ceil($total / $pageSize);
        $offset = ($page - 1) * $pageSize;
        $paginatedSubmissions = array_slice($groupedSubmissions, $offset, $pageSize);

        // Transform to resources
        $data = array_map(function ($submission) {
            return new ProposalSubmissionResource($submission);
        }, $paginatedSubmissions);

        return response()->json([
            'success' => true,
            'data' => $data,
            'pagination' => [
                'page' => $page,
                'pageSize' => $pageSize,
                'total' => $total,
                'totalPages' => $totalPages,
            ],
        ]);
    }

    /**
     * Create a proposal on behalf of a student or student group
     * Project Committee is not restricted by time windows
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'proposed_supervisor_id' => 'nullable|exists:users,id',
            'submitter_id' => 'required|exists:users,id',
            'student_group_id' => 'nullable|exists:student_groups,id',
            'target_project_id' => 'nullable|exists:projects,id',
        ]);

        // Validate that submitter_id is a student
        $submitter = \App\Models\User::findOrFail($validated['submitter_id']);
        if (!$submitter->isStudent()) {
            return response()->json([
                'success' => false,
                'message' => 'Submitter must be a student',
            ], 422);
        }

        // If student_group_id is provided, validate submitter is a member
        if (isset($validated['student_group_id'])) {
            $studentGroup = \App\Models\StudentGroup::findOrFail($validated['student_group_id']);
            if (!$studentGroup->hasMember($submitter->id) && $studentGroup->leader_id !== $submitter->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Submitter must be a member of the selected group',
                ], 422);
            }
        }

        // Validate that proposed_supervisor_id is actually a supervisor
        if (isset($validated['proposed_supervisor_id'])) {
            $supervisor = \App\Models\User::find($validated['proposed_supervisor_id']);
            if (!$supervisor || !$supervisor->isSupervisor()) {
                return response()->json([
                    'success' => false,
                    'message' => 'The selected user is not a supervisor',
                ], 422);
            }
        }

        try {
            $proposal = $this->proposalService->create($validated, $submitter);

            return response()->json([
                'success' => true,
                'data' => new ProposalResource($proposal->load(['submitter', 'proposedSupervisor', 'studentGroup', 'targetProject'])),
                'message' => 'Proposal created successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function show(Proposal $proposal): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new ProposalResource($proposal->load(['submitter', 'reviewer', 'project'])),
        ]);
    }

    public function approve(Request $request, Proposal $proposal): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'nullable|exists:projects,id',
        ]);

        try {
            $approved = $this->proposalService->approve(
                $proposal,
                $request->user(),
                $validated['project_id'] ?? null
            );

            return response()->json([
                'success' => true,
                'data' => new ProposalResource($approved->load(['submitter', 'reviewer'])),
                'message' => 'Proposal approved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function reject(Request $request, Proposal $proposal): JsonResponse
    {
        $validated = $request->validate([
            'review_notes' => 'nullable|string',
        ]);

        try {
            $rejected = $this->proposalService->reject(
                $proposal,
                $request->user(),
                $validated['review_notes'] ?? null
            );

            return response()->json([
                'success' => true,
                'data' => new ProposalResource($rejected->load(['submitter', 'reviewer'])),
                'message' => 'Proposal rejected',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function requestModification(Request $request, Proposal $proposal): JsonResponse
    {
        $validated = $request->validate([
            'review_notes' => 'required|string',
        ]);

        try {
            $updated = $this->proposalService->requestModification(
                $proposal,
                $request->user(),
                $validated['review_notes']
            );

            return response()->json([
                'success' => true,
                'data' => new ProposalResource($updated->load(['submitter', 'reviewer'])),
                'message' => 'Modification requested',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function update(Request $request, Proposal $proposal): JsonResponse
    {
        $this->authorize('update', $proposal);

        // Projects Committee can only edit title and description
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        try {
            $updated = $this->proposalService->update(
                $proposal,
                $validated,
                $request->user()
            );

            return response()->json([
                'success' => true,
                'data' => new ProposalResource($updated->load(['submitter', 'reviewer', 'project'])),
                'message' => 'Proposal updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function destroy(Request $request, Proposal $proposal): JsonResponse
    {
        $this->authorize('delete', $proposal);

        try {
            $this->proposalService->delete($proposal);

            return response()->json([
                'success' => true,
                'message' => 'Proposal deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}

