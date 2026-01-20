<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProposalResource;
use App\Http\Traits\HasTableQuery;
use App\Models\Proposal;
use App\Services\ProposalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProposalController extends Controller
{
    use HasTableQuery;

    public function __construct(
        protected ProposalService $proposalService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Proposal::with(['submitter', 'reviewer', 'project', 'studentGroup', 'targetProject']);

        // Get filters from request
        $filters = $request->get('filters', []);

        // For "My Proposals" route: filter by submitter_id (user's proposals)
        // For "Approved Proposals" route: show all approved proposals (no submitter filter)
        if (isset($filters['submitterId'])) {
            // Explicitly filter by submitterId (for "My Proposals")
            $query->where('submitter_id', $filters['submitterId']);
        } elseif (isset($filters['status']) && $filters['status'] === 'approved') {
            // For "Approved Proposals": show all approved proposals (no submitter filter)
            // Don't apply submitter filter
        } else {
            // Default behavior: show only user's proposals
            $query->where('submitter_id', $request->user()->id);
        }

        $query = $this->applyTableQuery($query, $request);

        return response()->json($this->getPaginatedResponse($query, $request, ProposalResource::class));
    }

    public function store(Request $request): JsonResponse
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
        
        // During proposal_submission window: groups are optional
        // During project_registration window: groups are required
        $groupRequired = $isRegistrationWindow && !$isProposalSubmissionWindow;
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'requirements' => 'nullable|string',
            'proposed_supervisor_id' => 'nullable|exists:users,id',
            'team_members' => 'nullable|array',
            'team_members.*.name' => 'required_with:team_members|string|max:255',
            'team_members.*.role' => 'required_with:team_members|string|max:255',
            'student_group_id' => $groupRequired ? 'required|exists:student_groups,id' : 'nullable|exists:student_groups,id',
            'target_project_id' => 'nullable|exists:projects,id',
        ]);

        // Enforce Group Submission Rule:
        // "All proposals submitted after group creation must be submitted in the group's name."
        $userGroup = \App\Models\StudentGroup::where('status', 'active')
            ->where(function ($query) use ($user) {
                $query->where('leader_id', $user->id)
                    ->orWhereHas('members', function ($q) use ($user) {
                        $q->where('users.id', $user->id);
                    });
            })
            ->first();

        if ($userGroup) {
            if (empty($validated['student_group_id'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are a member of a student group. You must submit the proposal in your group\'s name.',
                ], 422);
            }

            if ((int)$validated['student_group_id'] !== $userGroup->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only submit proposals for your own group.',
                ], 403);
            }
        }

        // During project_registration window (and not proposal_submission), require group
        if ($groupRequired && empty($validated['student_group_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'During project registration window, proposals must be submitted under a group name',
            ], 422);
        }

        // If student_group_id is provided, validate student is a member
        if (isset($validated['student_group_id'])) {
            $studentGroup = \App\Models\StudentGroup::findOrFail($validated['student_group_id']);
            if (!$studentGroup->hasMember($user->id) && $studentGroup->leader_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You must be a member of the selected group to submit a proposal',
                ], 403);
            }

            // During registration window (and not proposal_submission), enforce group size requirements
            if ($groupRequired) {
                // Validate group meets minimum and maximum member requirements
                $minMembers = app(\App\Services\SettingsService::class)->getGroupMinMembers();
                $maxMembers = app(\App\Services\SettingsService::class)->getGroupMaxMembers();
                $totalMembers = $studentGroup->getTotalMemberCount();
                
                if ($totalMembers < $minMembers) {
                    return response()->json([
                        'success' => false,
                        'message' => "Group must have at least {$minMembers} members to submit a proposal during registration window",
                    ], 422);
                }
                
                if ($totalMembers > $maxMembers) {
                    return response()->json([
                        'success' => false,
                        'message' => "Group cannot have more than {$maxMembers} members",
                    ], 422);
                }
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

        $proposal = $this->proposalService->create($validated, $user);

        return response()->json([
            'success' => true,
            'data' => new ProposalResource($proposal->load(['submitter', 'proposedSupervisor', 'studentGroup'])),
            'message' => 'Proposal created successfully',
        ], 201);
    }

    public function show(Proposal $proposal): JsonResponse
    {
        $this->authorize('view', $proposal);

        return response()->json([
            'success' => true,
            'data' => new ProposalResource($proposal->load(['submitter', 'reviewer', 'project'])),
        ]);
    }

    public function update(Request $request, Proposal $proposal): JsonResponse
    {
        $this->authorize('update', $proposal);

        $timeWindowService = app(\App\Services\TimeWindowService::class);
        
        // Check which window is active
        $isProposalSubmissionWindow = $timeWindowService->isWindowActive(\App\Enums\TimePeriodType::PROPOSAL_SUBMISSION);
        $isRegistrationWindow = $timeWindowService->isWindowActive(\App\Enums\TimePeriodType::PROJECT_REGISTRATION);
        
        // Students can update proposals during active windows OR when proposal requires modification
        $canUpdate = $isProposalSubmissionWindow || $isRegistrationWindow || $proposal->requiresModification();
        
        if (!$canUpdate) {
            return response()->json([
                'success' => false,
                'message' => 'Proposal updates are only allowed during proposal submission or project registration windows, or when revisions are requested.',
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'requirements' => 'nullable|string',
            'proposed_supervisor_id' => 'nullable|exists:users,id',
            'team_members' => 'nullable|array',
            'team_members.*.name' => 'required_with:team_members|string|max:255',
            'team_members.*.role' => 'required_with:team_members|string|max:255',
        ]);

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

        // Use service to update proposal (enforces status check)
        $proposal = $this->proposalService->update($proposal, $validated, $request->user());

        return response()->json([
            'success' => true,
            'data' => new ProposalResource($proposal->load(['submitter', 'reviewer', 'proposedSupervisor', 'studentGroup', 'targetProject'])),
            'message' => 'Proposal updated successfully',
        ]);
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

