<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProposalResource;
use App\Http\Resources\ProposalSubmissionResource;
use App\Http\Traits\HasTableQuery;
use App\Models\Proposal;
use App\Models\ProposalSubmission;
use App\Services\ProposalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProposalController extends Controller
{
    use HasTableQuery;

    public function __construct(
        protected ProposalService $proposalService
    ) {}

    /**
     * Get proposal submission
     * - During Proposal Submission period: Any student can view their submission
     * - During Project Registration period: Only group leaders can view
     */
    public function getSubmission(Request $request): JsonResponse
    {
        $user = $request->user();
        $timeWindowService = app(\App\Services\TimeWindowService::class);
        
        // Check which window is active
        $isProposalSubmissionWindow = $timeWindowService->isWindowActive(\App\Enums\TimePeriodType::PROPOSAL_SUBMISSION);
        $isRegistrationWindow = $timeWindowService->isWindowActive(\App\Enums\TimePeriodType::PROJECT_REGISTRATION);
        
        // During Project Registration period: only group leaders can view
        if ($isRegistrationWindow && !$isProposalSubmissionWindow) {
            $userGroup = \App\Models\StudentGroup::where('status', 'active')
                ->where('leader_id', $user->id)
                ->first();

            if (!$userGroup) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only group leaders can view proposal submissions during project registration period',
                    'data' => null,
                ], 403);
            }
            
            // Get existing submission for the group
            $submission = $this->proposalService->getExistingSubmission($user, $userGroup->id);
        } else {
            // During Proposal Submission period: any student can view their submission
            // Check if user is in a group (optional)
            $userGroup = \App\Models\StudentGroup::where('status', 'active')
                ->where(function ($query) use ($user) {
                    $query->where('leader_id', $user->id)
                        ->orWhereHas('members', function ($q) use ($user) {
                            $q->where('users.id', $user->id);
                        });
                })
                ->first();
            
            $groupId = $userGroup ? $userGroup->id : null;
            $submission = $this->proposalService->getExistingSubmission($user, $groupId);
        }

        return response()->json([
            'success' => true,
            'data' => $submission ? new ProposalSubmissionResource($submission->load('proposals')) : null,
        ]);
    }

    /**
     * Submit proposals
     * - During Proposal Submission period: Allow individual students (no group required)
     * - During Project Registration period: Require groups (only group leaders)
     */
    public function submitProposals(Request $request): JsonResponse
    {
        $user = $request->user();
        $timeWindowService = app(\App\Services\TimeWindowService::class);

        // Check which window is active
        $isProposalSubmissionWindow = $timeWindowService->isWindowActive(\App\Enums\TimePeriodType::PROPOSAL_SUBMISSION);
        $isRegistrationWindow = $timeWindowService->isWindowActive(\App\Enums\TimePeriodType::PROJECT_REGISTRATION);
        
        // Students must have at least one active window to submit proposals
        if (!$isProposalSubmissionWindow && !$isRegistrationWindow) {
            return response()->json([
                'success' => false,
                'message' => 'Proposal submission is only allowed during proposal submission or project registration windows',
            ], 403);
        }

        // During Project Registration period: groups are required
        // During Proposal Submission period: groups are optional (individual submission allowed)
        $groupRequired = $isRegistrationWindow && !$isProposalSubmissionWindow;
        
        $userGroup = null;
        if ($groupRequired) {
            // Check if user is a group leader (required for Project Registration period)
            $userGroup = \App\Models\StudentGroup::where('status', 'active')
                ->where('leader_id', $user->id)
                ->first();

            if (!$userGroup) {
                return response()->json([
                    'success' => false,
                    'message' => 'During project registration period, you must be a group leader to submit proposals',
                ], 403);
            }
        } else {
            // During Proposal Submission period: check if user is in a group (optional)
            $userGroup = \App\Models\StudentGroup::where('status', 'active')
                ->where(function ($query) use ($user) {
                    $query->where('leader_id', $user->id)
                        ->orWhereHas('members', function ($q) use ($user) {
                            $q->where('users.id', $user->id);
                        });
                })
                ->first();
        }

        // Check if user has already submitted
        $groupId = $userGroup ? $userGroup->id : null;
        if ($this->proposalService->hasSubmitted($user, $groupId)) {
            return response()->json([
                'success' => false,
                'message' => 'You have already submitted a proposal submission. You can only edit existing proposals.',
            ], 422);
        }

        // Validate proposals array
        $validated = $request->validate([
            'proposals' => 'required|array|min:1|max:5',
            'proposals.*.title' => 'required|string|max:255',
            'proposals.*.description' => 'required|string',
            'proposals.*.proposed_supervisor_id' => 'nullable|exists:users,id',
            'proposals.*.team_members' => 'nullable|array',
            'proposals.*.team_members.*.name' => 'required_with:proposals.*.team_members|string|max:255',
            'proposals.*.team_members.*.role' => 'required_with:proposals.*.team_members|string|max:255',
            'proposals.*.target_project_id' => 'nullable|exists:projects,id',
        ]);

        // Validate group size requirements (only if group exists)
        if ($userGroup) {
            $minMembers = app(\App\Services\SettingsService::class)->getGroupMinMembers();
            $maxMembers = app(\App\Services\SettingsService::class)->getGroupMaxMembers();
            $totalMembers = $userGroup->getTotalMemberCount();
            
            if ($totalMembers < $minMembers) {
                return response()->json([
                    'success' => false,
                    'message' => "Group must have at least {$minMembers} members to submit proposals",
                ], 422);
            }
            
            if ($totalMembers > $maxMembers) {
                return response()->json([
                    'success' => false,
                    'message' => "Group cannot have more than {$maxMembers} members",
                ], 422);
            }
        }

        // Validate proposed supervisors
        foreach ($validated['proposals'] as $proposalData) {
            if (isset($proposalData['proposed_supervisor_id'])) {
                $supervisor = \App\Models\User::find($proposalData['proposed_supervisor_id']);
                if (!$supervisor || !$supervisor->isSupervisor()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'The selected user is not a supervisor',
                    ], 422);
                }
            }
        }

        try {
            // Create submission with proposals (group_id is optional during Proposal Submission period)
            $submission = $this->proposalService->createSubmission(
                $validated['proposals'],
                $user,
                $userGroup ? $userGroup->id : null
            );

            // Submit the submission
            $submission = $this->proposalService->submitSubmission($submission);

            return response()->json([
                'success' => true,
                'data' => new ProposalSubmissionResource($submission->load('proposals')),
                'message' => 'Proposals submitted successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Update proposal submission (allow editing proposals but prevent adding new ones)
     */
    public function updateSubmission(Request $request): JsonResponse
    {
        $user = $request->user();
        $timeWindowService = app(\App\Services\TimeWindowService::class);

        // Check which window is active
        $isProposalSubmissionWindow = $timeWindowService->isWindowActive(\App\Enums\TimePeriodType::PROPOSAL_SUBMISSION);
        $isRegistrationWindow = $timeWindowService->isWindowActive(\App\Enums\TimePeriodType::PROJECT_REGISTRATION);
        
        // Students can update during active windows OR when submission requires modification
        $submission = $this->proposalService->getExistingSubmission($user);
        
        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'No submission found',
            ], 404);
        }

        $canUpdate = $isProposalSubmissionWindow 
            || $isRegistrationWindow 
            || $submission->requiresModification()
            || $submission->allowsNewProposals();

        if (!$canUpdate) {
            return response()->json([
                'success' => false,
                'message' => 'Submission updates are only allowed during proposal submission or project registration windows, or when revisions are requested.',
            ], 403);
        }

        // Check permissions based on period type
        $groupRequired = $isRegistrationWindow && !$isProposalSubmissionWindow;
        
        if ($submission->student_group_id) {
            // Submission has a group - verify user is group leader
            $userGroup = \App\Models\StudentGroup::find($submission->student_group_id);
            if (!$userGroup || $userGroup->leader_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only group leaders can update group submissions',
                ], 403);
            }
        } elseif ($submission->submitter_id !== $user->id) {
            // Individual submission - verify user is the submitter
            return response()->json([
                'success' => false,
                'message' => 'You can only update your own submission',
            ], 403);
        }

        // Validate proposals array
        $validated = $request->validate([
            'proposals' => 'required|array|min:1',
            'proposals.*.id' => 'nullable|exists:proposals,id',
            'proposals.*.title' => 'required|string|max:255',
            'proposals.*.description' => 'required|string',
            'proposals.*.proposed_supervisor_id' => 'nullable|exists:users,id',
            'proposals.*.team_members' => 'nullable|array',
            'proposals.*.team_members.*.name' => 'required_with:proposals.*.team_members|string|max:255',
            'proposals.*.team_members.*.role' => 'required_with:proposals.*.team_members|string|max:255',
            'proposals.*.target_project_id' => 'nullable|exists:projects,id',
        ]);

        // Validate proposed supervisors
        foreach ($validated['proposals'] as $proposalData) {
            if (isset($proposalData['proposed_supervisor_id'])) {
                $supervisor = \App\Models\User::find($proposalData['proposed_supervisor_id']);
                if (!$supervisor || !$supervisor->isSupervisor()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'The selected user is not a supervisor',
                    ], 422);
                }
            }
        }

        try {
            $submission = $this->proposalService->updateSubmission($submission, $validated['proposals'], $user);

            // If submission was in draft and is being updated, submit it
            if ($submission->status->value === 'draft' && $request->has('submit') && $request->input('submit') === true) {
                $submission = $this->proposalService->submitSubmission($submission);
            }

            return response()->json([
                'success' => true,
                'data' => new ProposalSubmissionResource($submission->load('proposals')),
                'message' => 'Submission updated successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Legacy index method - kept for backward compatibility
     * Returns proposals from user's submission if exists
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Check if user has a submission
        $submission = $this->proposalService->getExistingSubmission($user);
        
        if ($submission) {
            // Return proposals from submission - use where() to get a Builder instead of HasMany
            $query = Proposal::where('submission_id', $submission->id)
                ->with(['submitter', 'reviewer', 'project', 'studentGroup', 'targetProject']);
            $query = $this->applyTableQuery($query, $request);
            return response()->json($this->getPaginatedResponse($query, $request, ProposalResource::class));
        }

        // Return empty result if no submission
        return response()->json($this->getPaginatedResponse(
            Proposal::whereRaw('1 = 0'), // Empty query
            $request,
            ProposalResource::class
        ));
    }

    public function show(Proposal $proposal): JsonResponse
    {
        $this->authorize('view', $proposal);

        return response()->json([
            'success' => true,
            'data' => new ProposalResource($proposal->load(['submitter', 'reviewer', 'project'])),
        ]);
    }

    /**
     * Legacy store method - redirects to submitProposals
     */
    public function store(Request $request): JsonResponse
    {
        return $this->submitProposals($request);
    }

    /**
     * Legacy update method - redirects to updateSubmission
     */
    public function update(Request $request, Proposal $proposal): JsonResponse
    {
        // Get submission for this proposal
        $submission = $proposal->submission;
        
        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'Proposal is not part of a submission',
            ], 404);
        }

        // Get all proposals from submission
        $proposalsData = $submission->proposals->map(function ($p) use ($proposal, $request) {
            if ($p->id === $proposal->id) {
                // Update the specific proposal with request data
                return [
                    'id' => $p->id,
                    'title' => $request->input('title', $p->title),
                    'description' => $request->input('description', $p->description),
                    'proposed_supervisor_id' => $request->input('proposed_supervisor_id', $p->proposed_supervisor_id),
                    'team_members' => $request->input('team_members', $p->team_members),
                    'target_project_id' => $request->input('target_project_id', $p->target_project_id),
                ];
            }
            return [
                'id' => $p->id,
                'title' => $p->title,
                'description' => $p->description,
                'proposed_supervisor_id' => $p->proposed_supervisor_id,
                'team_members' => $p->team_members,
                'target_project_id' => $p->target_project_id,
            ];
        })->toArray();

        // Create a new request with proposals array
        $newRequest = new Request(['proposals' => $proposalsData]);
        $newRequest->setUserResolver($request->getUserResolver());

        return $this->updateSubmission($newRequest);
    }

    protected function applySearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        });
    }

    protected function applyFilters($query, array $filters)
    {
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        return $query;
    }
}
