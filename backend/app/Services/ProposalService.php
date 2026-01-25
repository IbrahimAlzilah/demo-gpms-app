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
        }
        
        $proposal->update(array_merge($updateData, $statusUpdate));

        return $proposal->fresh();
    }

    /**
     * Check if proposal has associated group registrations
     * Returns array with 'has_registrations' flag and details
     */
    public function checkForRegistrations(Proposal $proposal): array
    {
        $hasRegistrations = false;
        $registrationDetails = [];

        // Check project created from this proposal (project_id)
        if ($proposal->project_id) {
            $project = Project::find($proposal->project_id);
            if ($project) {
                // Check if project has assigned group
                if ($project->assigned_group_id) {
                    $hasRegistrations = true;
                    $assignedGroup = $project->assignedGroup;
                    $registrationDetails[] = [
                        'type' => 'assigned_group',
                        'project_id' => $project->id,
                        'project_title' => $project->title,
                        'group_id' => $project->assigned_group_id,
                        'group_name' => $assignedGroup?->name ?? "Group #{$project->assigned_group_id}",
                    ];
                }

                // Check if project has registrations
                $registrationsCount = $project->registrations()->count();
                if ($registrationsCount > 0) {
                    $hasRegistrations = true;
                    $registrationDetails[] = [
                        'type' => 'registrations',
                        'project_id' => $project->id,
                        'project_title' => $project->title,
                        'count' => $registrationsCount,
                    ];
                }

                // Check if project has students assigned
                $studentsCount = $project->students()->count();
                if ($studentsCount > 0) {
                    $hasRegistrations = true;
                    $registrationDetails[] = [
                        'type' => 'assigned_students',
                        'project_id' => $project->id,
                        'project_title' => $project->title,
                        'count' => $studentsCount,
                    ];
                }
            }
        }

        // Check target project (target_project_id)
        if ($proposal->target_project_id) {
            $targetProject = Project::find($proposal->target_project_id);
            if ($targetProject) {
                // Check if target project has assigned group
                if ($targetProject->assigned_group_id) {
                    $hasRegistrations = true;
                    $assignedGroup = $targetProject->assignedGroup;
                    $registrationDetails[] = [
                        'type' => 'assigned_group',
                        'project_id' => $targetProject->id,
                        'project_title' => $targetProject->title,
                        'group_id' => $targetProject->assigned_group_id,
                        'group_name' => $assignedGroup?->name ?? "Group #{$targetProject->assigned_group_id}",
                    ];
                }

                // Check if target project has registrations
                $registrationsCount = $targetProject->registrations()->count();
                if ($registrationsCount > 0) {
                    $hasRegistrations = true;
                    $registrationDetails[] = [
                        'type' => 'registrations',
                        'project_id' => $targetProject->id,
                        'project_title' => $targetProject->title,
                        'count' => $registrationsCount,
                    ];
                }

                // Check if target project has students assigned
                $studentsCount = $targetProject->students()->count();
                if ($studentsCount > 0) {
                    $hasRegistrations = true;
                    $registrationDetails[] = [
                        'type' => 'assigned_students',
                        'project_id' => $targetProject->id,
                        'project_title' => $targetProject->title,
                        'count' => $studentsCount,
                    ];
                }
            }
        }

        // Check if student group has project registrations
        if ($proposal->student_group_id) {
            $studentGroup = \App\Models\StudentGroup::find($proposal->student_group_id);
            if ($studentGroup && $studentGroup->hasProjectRegistrations()) {
                $hasRegistrations = true;
                $registrationDetails[] = [
                    'type' => 'group_registrations',
                    'group_id' => $studentGroup->id,
                    'group_name' => $studentGroup->name ?? "Group #{$studentGroup->id}",
                ];
            }
        }

        return [
            'has_registrations' => $hasRegistrations,
            'details' => $registrationDetails,
        ];
    }

    /**
     * Delete a proposal and all related data
     * Note: This does NOT delete the project itself, only the proposal link
     */
    public function delete(Proposal $proposal): bool
    {
        return DB::transaction(function () use ($proposal) {
            // Delete related notifications
            \App\Models\Notification::where('notifiable_type', 'proposal')
                ->where('notifiable_id', $proposal->id)
                ->delete();

            // Note: We do NOT delete the project (project_id) as it may be used by other proposals
            // Note: We do NOT delete the target project (target_project_id) as it's just a reference
            // Note: We do NOT delete the student group (student_group_id) as it may have other proposals
            // The proposal deletion will cascade via foreign keys if configured, but we're being explicit here

            // Delete the proposal
            return $proposal->delete();
        });
    }

    /**
     * Create multiple proposals in a batch
     * 
     * @param array $proposalsData Array of proposal data arrays
     * @param User $submitter The user submitting the proposals
     * @param int|null $studentGroupId The student group ID (null for solo students)
     * @return array Array of created Proposal models
     */
    public function createBatch(array $proposalsData, User $submitter, ?int $studentGroupId = null): array
    {
        return DB::transaction(function () use ($proposalsData, $submitter, $studentGroupId) {
            $createdProposals = [];
            
            foreach ($proposalsData as $data) {
                $proposal = Proposal::create([
                    'title' => $data['title'],
                    'description' => $data['description'],
                    'submitter_id' => $submitter->id,
                    'student_group_id' => $studentGroupId,
                    'target_project_id' => $data['target_project_id'] ?? null,
                    'status' => 'pending_review',
                ]);
                
                $createdProposals[] = $proposal;
            }

            // Mark group as having submitted initial proposals (lock future submissions)
            if ($studentGroupId) {
                $studentGroup = \App\Models\StudentGroup::find($studentGroupId);
                if ($studentGroup && !$studentGroup->proposals_initial_submitted_at) {
                    $studentGroup->update([
                        'proposals_initial_submitted_at' => now(),
                    ]);
                }
            } elseif ($submitter->isSupervisor()) {
                // Mark supervisor as having submitted initial proposals (lock future submissions)
                if (!$submitter->proposals_initial_submitted_at) {
                    $submitter->update([
                        'proposals_initial_submitted_at' => now(),
                    ]);
                }
            }

            // Notify projects committee members about new proposals (single notification for batch)
            $committeeMembers = User::where('role', 'projects_committee')
                ->where('status', 'active')
                ->pluck('id')
                ->toArray();

            if (!empty($committeeMembers) && !empty($createdProposals)) {
                $submitterName = $studentGroupId 
                    ? ($createdProposals[0]->studentGroup?->name ?? $submitter->name)
                    : $submitter->name;
                $count = count($createdProposals);
                $message = $count === 1 
                    ? "تم تقديم مقترح جديد: {$createdProposals[0]->title} من قبل {$submitterName}"
                    : "تم تقديم {$count} مقترحات جديدة من قبل {$submitterName}";
                
                $this->notificationService->createForUsers(
                    $committeeMembers,
                    $message,
                    'proposal_submitted',
                    'proposal',
                    $createdProposals[0]->id
                );
            }

            return $createdProposals;
        });
    }

    /**
     * Update multiple proposals and optionally add new ones in a batch
     * 
     * @param array $updates Array of updates: ['id' => proposal_id, ...data] for existing proposals
     * @param array $newProposals Array of new proposal data arrays
     * @param User $user The user performing the update
     * @param int|null $studentGroupId The student group ID (null for solo students)
     * @return array Array with 'updated' and 'created' Proposal models
     */
    public function updateBatch(array $updates, array $newProposals, User $user, ?int $studentGroupId = null): array
    {
        return DB::transaction(function () use ($updates, $newProposals, $user, $studentGroupId) {
            $updatedProposals = [];
            $createdProposals = [];

            // Update existing proposals
            foreach ($updates as $updateData) {
                $proposalId = $updateData['id'];
                unset($updateData['id']);
                
                $proposal = Proposal::findOrFail($proposalId);
                
                // Enforce status check for non-committee members
                if (!$user->isProjectsCommittee() && !$proposal->canBeModified()) {
                    throw new \Illuminate\Http\Exceptions\HttpResponseException(
                        response()->json([
                            'success' => false,
                            'message' => "Proposal #{$proposalId} can only be edited when status is pending_review or requires_modification",
                        ], 403)
                    );
                }

                // If proposal requires modification and is being updated, change status to pending_review
                $statusUpdate = [];
                if ($proposal->status === ProposalStatus::REQUIRES_MODIFICATION) {
                    $statusUpdate['status'] = ProposalStatus::PENDING_REVIEW;
                }

                $updateFields = [
                    'title' => $updateData['title'] ?? $proposal->title,
                    'description' => $updateData['description'] ?? $proposal->description,
                ];
                
                if (!$user->isProjectsCommittee()) {
                    $updateFields['proposed_supervisor_id'] = $updateData['proposed_supervisor_id'] ?? $proposal->proposed_supervisor_id;
                }
                
                $proposal->update(array_merge($updateFields, $statusUpdate));
                $updatedProposals[] = $proposal->fresh();
            }

            // Create new proposals (allowed during edit)
            if (!empty($newProposals)) {
                foreach ($newProposals as $data) {
                    $proposal = Proposal::create([
                        'title' => $data['title'],
                        'description' => $data['description'],
                        'proposed_supervisor_id' => $data['proposed_supervisor_id'] ?? null,
                        'submitter_id' => $user->id,
                        'student_group_id' => $studentGroupId,
                        'target_project_id' => $data['target_project_id'] ?? null,
                        'status' => 'pending_review',
                    ]);
                    
                    $createdProposals[] = $proposal;
                }
            }

            return [
                'updated' => $updatedProposals,
                'created' => $createdProposals,
            ];
        });
    }

    /**
     * Check if a group is locked from submitting new proposals
     * 
     * @param int|null $studentGroupId The student group ID (null for solo students)
     * @return bool True if locked, false otherwise
     */
    public function isGroupLocked(?int $studentGroupId): bool
    {
        if (!$studentGroupId) {
            // Solo students are never locked (they can always submit)
            return false;
        }

        $studentGroup = \App\Models\StudentGroup::find($studentGroupId);
        if (!$studentGroup) {
            return false;
        }

        // Group is locked if it has submitted initial proposals
        return $studentGroup->proposals_initial_submitted_at !== null;
    }

    /**
     * Check if a supervisor is locked from submitting new proposals
     * 
     * @param User $user The supervisor user
     * @return bool True if locked, false otherwise
     */
    public function isSupervisorLocked(User $user): bool
    {
        if (!$user->isSupervisor()) {
            return false;
        }

        // Supervisor is locked if they have submitted initial proposals
        return $user->proposals_initial_submitted_at !== null;
    }
}

