<?php

namespace App\Services;

use App\Models\Proposal;
use App\Models\User;
use App\Models\Project;
use App\Enums\ProposalStatus;
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
                    $this->projectService->assignSupervisor($project, $supervisor);
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
}

