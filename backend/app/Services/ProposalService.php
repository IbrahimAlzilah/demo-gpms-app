<?php

namespace App\Services;

use App\Models\Proposal;
use App\Models\ProposalSubmission;
use App\Models\User;
use App\Models\Project;
use App\Enums\ProposalStatus;
use App\Enums\ProposalSubmissionStatus;
use Illuminate\Support\Facades\DB;

class ProposalService
{
    public function __construct(
        protected NotificationService $notificationService,
        protected ProjectService $projectService
    ) {}

    /**
     * Create a new proposal
     */
    public function create(array $data, User $submitter): Proposal
    {
        $proposal = Proposal::create([
            'title' => $data['title'],
            'description' => $data['description'],
            'proposed_supervisor_id' => $data['proposed_supervisor_id'] ?? null,
            'team_members' => $data['team_members'] ?? null,
            'submitter_id' => $submitter->id,
            'student_group_id' => $data['student_group_id'] ?? null,
            'target_project_id' => $data['target_project_id'] ?? null,
            'status' => 'pending_review',
        ]);

        // Notify projects committee members about new proposal
        $committeeMembers = User::where('role', 'projects_committee')
            ->where('status', 'active')
            ->pluck('id')
            ->toArray();

        if (!empty($committeeMembers)) {
            $submitterName = $proposal->studentGroup ? $proposal->studentGroup->name : $submitter->name;
            $this->notificationService->createForUsers(
                $committeeMembers,
                "تم تقديم مقترح جديد: {$proposal->title} من قبل {$submitterName}",
                'proposal_submitted',
                'proposal',
                $proposal->id
            );
        }

        return $proposal;
    }

    /**
     * Approve a proposal and optionally create a project
     */
    public function approve(Proposal $proposal, User $reviewer, ?int $projectId = null): Proposal
    {
        return DB::transaction(function () use ($proposal, $reviewer, $projectId) {
            // Determine target project: use provided ID, target_project_id, or create new
            $targetProjectId = $projectId ?? $proposal->target_project_id;
            
            if (!$targetProjectId) {
                // Create a new project from the proposal
                $project = $this->projectService->createFromProposal([
                    'title' => $proposal->title,
                    'description' => $proposal->description,
                    'supervisor_id' => null, // Will be assigned later
                    'max_students' => 4,
                    'specialization' => null,
                    'keywords' => [],
                ], $proposal->id);

                $targetProjectId = $project->id;
            }

            $proposal->update([
                'status' => 'approved',
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
                'project_id' => $targetProjectId,
            ]);

            $proposal = $proposal->fresh();
            $project = Project::findOrFail($targetProjectId);

            // If proposal has a proposed supervisor, assign them pending approval
            if ($proposal->proposed_supervisor_id && !$project->supervisor_id) {
                $supervisor = User::find($proposal->proposed_supervisor_id);
                if ($supervisor && $supervisor->isSupervisor()) {
                    // Require approval when assigning from proposal
                    $this->projectService->assignSupervisor($project, $supervisor, true);
                }
            }

            // If proposal has a student_group_id, auto-register the group
            if ($proposal->student_group_id) {
                $studentGroup = \App\Models\StudentGroup::find($proposal->student_group_id);
                
                if ($studentGroup && $studentGroup->status === 'active') {
                    // Validate group meets registration requirements before auto-registering
                    if (!$studentGroup->meetsRegistrationRequirements()) {
                        $minMembers = app(\App\Services\SettingsService::class)->getGroupMinMembers();
                        $maxMembers = app(\App\Services\SettingsService::class)->getGroupMaxMembers();
                        $totalMembers = $studentGroup->getTotalMemberCount();
                        
                        if ($totalMembers < $minMembers) {
                            throw new \Exception("Group must have at least {$minMembers} members to be registered via proposal approval");
                        }
                        
                        if ($totalMembers > $maxMembers) {
                            throw new \Exception("Group cannot have more than {$maxMembers} members");
                        }
                    }
                    // Get all group members (including leader)
                    $groupMembers = $studentGroup->members()->pluck('users.id')->push($studentGroup->leader_id)->unique();
                    
                    // Attach all group members to project
                    foreach ($groupMembers as $memberId) {
                        if (!$project->students()->where('users.id', $memberId)->exists()) {
                            $project->students()->attach($memberId);
                            $project->increment('current_students');
                            
                            // Create approved registration records for all members
                            \App\Models\ProjectRegistration::updateOrCreate(
                                [
                                    'project_id' => $project->id,
                                    'student_id' => $memberId,
                                ],
                                [
                                    'status' => 'approved',
                                    'submitted_at' => now(),
                                    'reviewed_at' => now(),
                                    'reviewed_by' => $reviewer->id,
                                ]
                            );
                        }
                    }

                    // Mark project as assigned to this group and set status to IN_PROGRESS
                    // Per specification: When a group proposal is approved, the project becomes reserved for that group
                    $project->update([
                        'assigned_group_id' => $studentGroup->id,
                        'reserved_at' => now(),
                        'status' => \App\Enums\ProjectStatus::IN_PROGRESS->value,
                    ]);
                }
            }

            // Notify submitter about approval
            if ($proposal->submitter) {
                $this->notificationService->create(
                    $proposal->submitter,
                    "تم قبول مقترحك: {$proposal->title}",
                    'proposal_approved',
                    'proposal',
                    $proposal->id
                );
            }

            return $proposal;
        });
    }

    /**
     * Reject a proposal
     */
    public function reject(Proposal $proposal, User $reviewer, ?string $reviewNotes = null): Proposal
    {
        $proposal->update([
            'status' => 'rejected',
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'review_notes' => $reviewNotes,
        ]);

        $proposal = $proposal->fresh();

        // Notify submitter about rejection
        if ($proposal->submitter) {
            $message = "تم رفض مقترحك: {$proposal->title}";
            if ($reviewNotes) {
                $message .= "\nملاحظات المراجعة: {$reviewNotes}";
            }
            $this->notificationService->create(
                $proposal->submitter,
                $message,
                'proposal_rejected',
                'proposal',
                $proposal->id
            );
        }

        return $proposal;
    }

    /**
     * Request modification for a proposal
     */
    public function requestModification(Proposal $proposal, User $reviewer, string $reviewNotes): Proposal
    {
        $proposal->update([
            'status' => 'requires_modification',
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'review_notes' => $reviewNotes,
        ]);

        $proposal = $proposal->fresh();

        // Notify submitter about modification request
        if ($proposal->submitter) {
            $message = "يتطلب مقترحك تعديلات: {$proposal->title}\nملاحظات المراجعة: {$reviewNotes}";
            $this->notificationService->create(
                $proposal->submitter,
                $message,
                'proposal_modification_required',
                'proposal',
                $proposal->id
            );
        }

        return $proposal;
    }

    /**
     * Update a proposal
     *
     * @param Proposal $proposal The proposal to update
     * @param array $data The data to update
     * @param User|null $user The user performing the update (null for committee members)
     * 
     * Note: Projects Committee members can edit proposals regardless of status.
     * For approved/rejected proposals, review data (reviewed_by, reviewed_at, review_notes, project_id)
     * is preserved to maintain data integrity.
     */
    public function update(Proposal $proposal, array $data, ?User $user = null): Proposal
    {
        // If user is provided and not a committee member, enforce status restriction
        if ($user && !$user->isProjectsCommittee()) {
            // Ensure proposal can be modified (status must be pending_review or requires_modification)
            if (!$proposal->canBeModified()) {
                throw new \Illuminate\Http\Exceptions\HttpResponseException(
                    response()->json([
                        'success' => false,
                        'message' => 'Proposal can only be edited when status is pending_review or requires_modification',
                    ], 403)
                );
            }
        }

        // If proposal requires modification and is being updated, change status to pending_review
        // Note: For approved/rejected proposals, status is preserved (committee can edit without changing status)
        $statusUpdate = [];
        if ($proposal->status === ProposalStatus::REQUIRES_MODIFICATION) {
            $statusUpdate['status'] = ProposalStatus::PENDING_REVIEW;
        }

        // Update only editable fields
        // For Projects Committee: only title and description can be edited
        // Review data (reviewed_by, reviewed_at, review_notes, project_id) is preserved for approved/rejected proposals
        $updateData = [
            'title' => $data['title'] ?? $proposal->title,
            'description' => $data['description'] ?? $proposal->description,
        ];
        
        // Only update other fields if user is not a committee member (for backward compatibility with other roles)
        if ($user && !$user->isProjectsCommittee()) {
            $updateData['proposed_supervisor_id'] = $data['proposed_supervisor_id'] ?? $proposal->proposed_supervisor_id;
            $updateData['team_members'] = $data['team_members'] ?? $proposal->team_members;
        }
        
        $proposal->update(array_merge($updateData, $statusUpdate));

        return $proposal->fresh();
    }

    /**
     * Delete a proposal
     */
    public function delete(Proposal $proposal): bool
    {
        return $proposal->delete();
    }

    /**
     * Create a proposal submission with multiple proposals
     */
    public function createSubmission(array $proposalsData, User $submitter, ?int $studentGroupId = null): ProposalSubmission
    {
        return DB::transaction(function () use ($proposalsData, $submitter, $studentGroupId) {
            // Validate at least 1 proposal, max 5
            if (count($proposalsData) < 1 || count($proposalsData) > 5) {
                throw new \Exception('A submission must contain between 1 and 5 proposals');
            }

            // Create the submission
            $submission = ProposalSubmission::create([
                'submitter_id' => $submitter->id,
                'student_group_id' => $studentGroupId,
                'status' => ProposalSubmissionStatus::DRAFT,
            ]);

            // Create all proposals linked to this submission
            foreach ($proposalsData as $proposalData) {
                Proposal::create([
                    'title' => $proposalData['title'],
                    'description' => $proposalData['description'],
                    'proposed_supervisor_id' => $proposalData['proposed_supervisor_id'] ?? null,
                    'team_members' => $proposalData['team_members'] ?? null,
                    'submitter_id' => $submitter->id,
                    'student_group_id' => $studentGroupId,
                    'target_project_id' => $proposalData['target_project_id'] ?? null,
                    'submission_id' => $submission->id,
                    'status' => ProposalStatus::PENDING_REVIEW,
                ]);
            }

            return $submission->fresh()->load('proposals');
        });
    }

    /**
     * Submit a proposal submission (change status from draft to submitted)
     */
    public function submitSubmission(ProposalSubmission $submission): ProposalSubmission
    {
        if ($submission->status !== ProposalSubmissionStatus::DRAFT) {
            throw new \Exception('Only draft submissions can be submitted');
        }

        $submission->markAsSubmitted();

        // Notify projects committee members about new submission
        $committeeMembers = User::where('role', 'projects_committee')
            ->where('status', 'active')
            ->pluck('id')
            ->toArray();

        if (!empty($committeeMembers)) {
            $submitterName = $submission->studentGroup ? $submission->studentGroup->name : $submission->submitter->name;
            $proposalCount = $submission->proposals()->count();
            $this->notificationService->createForUsers(
                $committeeMembers,
                "تم تقديم طلب مقترحات جديد يحتوي على {$proposalCount} مقترح من قبل {$submitterName}",
                'proposal_submission_submitted',
                'proposal_submission',
                $submission->id
            );
        }

        return $submission->fresh();
    }

    /**
     * Check if a user has already submitted a proposal submission
     */
    public function hasSubmitted(User $user, ?int $studentGroupId = null): bool
    {
        $query = ProposalSubmission::where('submitter_id', $user->id);

        if ($studentGroupId) {
            $query->where('student_group_id', $studentGroupId);
        }

        return $query->whereIn('status', [
            ProposalSubmissionStatus::SUBMITTED,
            ProposalSubmissionStatus::UNDER_REVIEW,
            ProposalSubmissionStatus::REQUIRES_MODIFICATION,
        ])->exists();
    }

    /**
     * Get existing submission for a user
     */
    public function getExistingSubmission(User $user, ?int $studentGroupId = null): ?ProposalSubmission
    {
        $query = ProposalSubmission::with('proposals')
            ->where('submitter_id', $user->id);

        if ($studentGroupId) {
            $query->where('student_group_id', $studentGroupId);
        }

        return $query->first();
    }

    /**
     * Update a proposal submission (allow editing proposals and adding new ones while editing)
     */
    public function updateSubmission(ProposalSubmission $submission, array $proposalsData, User $user): ProposalSubmission
    {
        return DB::transaction(function () use ($submission, $proposalsData, $user) {
            // Check if trying to add new proposals when not allowed
            $existingCount = $submission->proposals()->count();
            $newCount = count($proposalsData);
            
            if (!$submission->allowsNewProposals() && $newCount > $existingCount) {
                throw new \Exception('Cannot add new proposals. Submission status does not allow modifications.');
            }
            
            // Validate max proposals limit (max 5)
            if ($newCount > 5) {
                throw new \Exception('Cannot have more than 5 proposals in a submission');
            }

            // Update existing proposals or create new ones (if allowed)
            $existingProposals = $submission->proposals()->get()->keyBy('id');
            $processedIds = [];
            
            foreach ($proposalsData as $index => $proposalData) {
                if (isset($proposalData['id']) && $existingProposals->has($proposalData['id'])) {
                    // Update existing proposal
                    $proposal = $existingProposals->get($proposalData['id']);
                    $proposal->update([
                        'title' => $proposalData['title'],
                        'description' => $proposalData['description'],
                        'proposed_supervisor_id' => $proposalData['proposed_supervisor_id'] ?? null,
                        'team_members' => $proposalData['team_members'] ?? null,
                        'target_project_id' => $proposalData['target_project_id'] ?? null,
                    ]);
                    $processedIds[] = $proposal->id;
                } elseif ($submission->allowsNewProposals()) {
                    // Create new proposal (allowed when editing)
                    Proposal::create([
                        'title' => $proposalData['title'],
                        'description' => $proposalData['description'],
                        'proposed_supervisor_id' => $proposalData['proposed_supervisor_id'] ?? null,
                        'team_members' => $proposalData['team_members'] ?? null,
                        'submitter_id' => $user->id,
                        'student_group_id' => $submission->student_group_id,
                        'target_project_id' => $proposalData['target_project_id'] ?? null,
                        'submission_id' => $submission->id,
                        'status' => ProposalStatus::PENDING_REVIEW,
                    ]);
                }
            }
            
            // Delete proposals that were removed (not in the new data)
            $submission->proposals()
                ->whereNotIn('id', $processedIds)
                ->delete();

            // If submission requires modification and is being updated, change status to draft
            if ($submission->status === ProposalSubmissionStatus::REQUIRES_MODIFICATION) {
                $submission->update(['status' => ProposalSubmissionStatus::DRAFT]);
            }

            return $submission->fresh()->load('proposals');
        });
    }

    /**
     * Approve a proposal submission
     */
    public function approveSubmission(ProposalSubmission $submission, User $reviewer, ?int $projectId = null): ProposalSubmission
    {
        return DB::transaction(function () use ($submission, $reviewer, $projectId) {
            // Approve all proposals in the submission
            foreach ($submission->proposals as $proposal) {
                $this->approve($proposal, $reviewer, $projectId);
            }

            // Update submission status
            $submission->update([
                'status' => ProposalSubmissionStatus::APPROVED,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
            ]);

            // Notify submitter
            if ($submission->submitter) {
                $this->notificationService->create(
                    $submission->submitter,
                    "تم قبول طلب المقترحات الخاص بك",
                    'proposal_submission_approved',
                    'proposal_submission',
                    $submission->id
                );
            }

            return $submission->fresh();
        });
    }

    /**
     * Reject a proposal submission
     */
    public function rejectSubmission(ProposalSubmission $submission, User $reviewer, ?string $reviewNotes = null): ProposalSubmission
    {
        // Reject all proposals in the submission
        foreach ($submission->proposals as $proposal) {
            $this->reject($proposal, $reviewer, $reviewNotes);
        }

        // Update submission status
        $submission->update([
            'status' => ProposalSubmissionStatus::REJECTED,
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'review_notes' => $reviewNotes,
        ]);

        // Notify submitter
        if ($submission->submitter) {
            $message = "تم رفض طلب المقترحات الخاص بك";
            if ($reviewNotes) {
                $message .= "\nملاحظات المراجعة: {$reviewNotes}";
            }
            $this->notificationService->create(
                $submission->submitter,
                $message,
                'proposal_submission_rejected',
                'proposal_submission',
                $submission->id
            );
        }

        return $submission->fresh();
    }

    /**
     * Request modification for a proposal submission
     */
    public function requestSubmissionModification(ProposalSubmission $submission, User $reviewer, string $reviewNotes): ProposalSubmission
    {
        // Mark all proposals as requiring modification
        foreach ($submission->proposals as $proposal) {
            $this->requestModification($proposal, $reviewer, $reviewNotes);
        }

        // Update submission status
        $submission->update([
            'status' => ProposalSubmissionStatus::REQUIRES_MODIFICATION,
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'review_notes' => $reviewNotes,
        ]);

        // Notify submitter
        if ($submission->submitter) {
            $message = "يتطلب طلب المقترحات الخاص بك تعديلات\nملاحظات المراجعة: {$reviewNotes}";
            $this->notificationService->create(
                $submission->submitter,
                $message,
                'proposal_submission_modification_required',
                'proposal_submission',
                $submission->id
            );
        }

        return $submission->fresh();
    }
}

