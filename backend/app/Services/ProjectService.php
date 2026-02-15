<?php

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use App\Models\ProjectRegistration;
use App\Enums\ProjectStatus;
use Illuminate\Support\Facades\DB;

class ProjectService
{
    public function __construct(
        protected ?NotificationService $notificationService = null
    ) {
        // Allow nullable for backward compatibility, but initialize if available
        $this->notificationService = $this->notificationService ?? app(NotificationService::class);
    }

    /**
     * Create a new project from a proposal
     */
    public function createFromProposal(array $data, ?int $proposalId = null): Project
    {
        $defaultMaxStudents = app(\App\Services\SettingsService::class)->getProjectDefaultMaxStudents();
        return Project::create([
            'title' => $data['title'],
            'description' => $data['description'],
            'status' => \App\Enums\ProjectStatus::DRAFT->value,
            'supervisor_id' => $data['supervisor_id'] ?? null,
            'max_students' => $data['max_students'] ?? $defaultMaxStudents,
            'current_students' => 0,
            'specialization' => $data['specialization'] ?? null,
        ]);
    }

    /**
     * Register a student to a project
     *
     * @deprecated Individual registration is not allowed. Use registerStudentGroup() instead.
     * This method is kept for backward compatibility but will throw an error.
     */
    public function registerStudent(Project $project, User $student): ProjectRegistration
    {
        // Per specification: Registration requires a student group
        throw new \Exception('Individual registration is not allowed. Registration must be done through a student group. Use registerStudentGroup() instead.');
    }

    /**
     * Register a student group to a project
     */
    public function registerStudentGroup(Project $project, \App\Models\StudentGroup $group, User $submitter): ProjectRegistration
    {
        if (!$project->isAvailableForRegistration()) {
            throw new \Exception('Project is not available for registration');
        }

        // Check if project is already assigned to another group
        if ($project->assigned_group_id && $project->assigned_group_id !== $group->id) {
            throw new \Exception('Project is already assigned to another group');
        }

        // Get all group members (including leader)
        $groupMembers = $group->members()->pluck('users.id')->push($group->leader_id)->unique();

        // Check if any member is already registered
        $alreadyRegistered = $project->students()->whereIn('users.id', $groupMembers)->exists();
        if ($alreadyRegistered) {
            throw new \Exception('One or more group members are already registered in this project');
        }

        // Create registration for the submitter (representing the group)
        return DB::transaction(function () use ($project, $group, $submitter, $groupMembers) {
            // Create registration record for the submitter
            $registration = ProjectRegistration::create([
                'project_id' => $project->id,
                'student_id' => $submitter->id,
                'status' => 'pending',
                'submitted_at' => now(),
            ]);

            // Notify projects committee about new group registration
            $committeeMembers = User::where('role', 'projects_committee')
                ->where('status', 'active')
                ->pluck('id')
                ->toArray();

            if (!empty($committeeMembers) && $this->notificationService) {
                $this->notificationService->createForUsers(
                    $committeeMembers,
                    "طلب تسجيل جديد من المجموعة {$group->name} في المشروع: {$project->title}",
                    'registration_submitted',
                    'project',
                    $project->id
                );
            }

            return $registration;
        });
    }

    /**
     * Validate that group is not already registered or assigned to a project
     */
    public function validateGroupNotRegistered(\App\Models\StudentGroup $group): void
    {
        $maxProjectsPerGroup = app(\App\Services\SettingsService::class)->getMaxProjectsPerGroup();
        // Count projects assigned to this group (in progress or completed)
        $assignedCount = Project::where('assigned_group_id', $group->id)
            ->whereIn('status', [\App\Enums\ProjectStatus::IN_PROGRESS->value, \App\Enums\ProjectStatus::COMPLETED->value])
            ->count();

        if ($assignedCount >= $maxProjectsPerGroup) {
            throw new \Exception("Group has reached the maximum number of projects allowed ({$maxProjectsPerGroup}).");
        }
    }

    /**
     * Register a student group to multiple projects in a batch request
     */
    public function registerGroupBatch(array $projectIds, \App\Models\StudentGroup $group, User $submitter): \App\Models\GroupRegistrationRequest
    {
        // Validate submitter is group leader
        if ($group->leader_id !== $submitter->id) {
            throw new \Exception('Only group leader can register for projects');
        }

        // Validate group not already registered/assigned
        $this->validateGroupNotRegistered($group);

        // Validate group size (2-5 members)
        if (!$group->meetsRegistrationRequirements()) {
            $minMembers = app(\App\Services\SettingsService::class)->getGroupMinMembers();
            $maxMembers = app(\App\Services\SettingsService::class)->getGroupMaxMembers();
            $totalMembers = $group->getTotalMemberCount();

            if ($totalMembers < $minMembers) {
                throw new \Exception("Group must have at least {$minMembers} members to register for projects");
            }

            if ($totalMembers > $maxMembers) {
                throw new \Exception("Group cannot have more than {$maxMembers} members to register for projects");
            }
        }

        // Validate all projects exist and are available
        $projects = Project::whereIn('id', $projectIds)->get();
        if ($projects->count() !== count($projectIds)) {
            throw new \Exception('One or more projects not found');
        }

        foreach ($projects as $project) {
            if (!$project->isAvailableForRegistration()) {
                throw new \Exception("Project '{$project->title}' is not available for registration");
            }

            // Check if project is already assigned to another group
            if ($project->assigned_group_id && $project->assigned_group_id !== $group->id) {
                throw new \Exception("Project '{$project->title}' is already assigned to another group");
            }
        }

        // Get all group members (including leader)
        $groupMembers = $group->members()->pluck('users.id')->push($group->leader_id)->unique();

        // Check if any member is already registered in any of the projects
        foreach ($projects as $project) {
            $alreadyRegistered = $project->students()->whereIn('users.id', $groupMembers)->exists();
            if ($alreadyRegistered) {
                throw new \Exception("One or more group members are already registered in project '{$project->title}'");
            }
        }

        return DB::transaction(function () use ($projects, $group, $submitter, $groupMembers) {
            // Create group registration request
            $request = \App\Models\GroupRegistrationRequest::create([
                'student_group_id' => $group->id,
                'submitted_by' => $submitter->id,
                'status' => 'pending',
                'submitted_at' => now(),
            ]);

            // Create project registration for each project
            foreach ($projects as $project) {
                ProjectRegistration::create([
                    'project_id' => $project->id,
                    'student_id' => $submitter->id,
                    'group_registration_request_id' => $request->id,
                    'status' => 'pending',
                    'submitted_at' => now(),
                ]);
            }

            // Notify projects committee about new batch registration
            $committeeMembers = User::where('role', 'projects_committee')
                ->where('status', 'active')
                ->pluck('id')
                ->toArray();

            if (!empty($committeeMembers) && $this->notificationService) {
                $projectTitles = $projects->pluck('title')->implode(', ');
                $this->notificationService->createForUsers(
                    $committeeMembers,
                    "طلب تسجيل جديد من المجموعة {$group->name} في المشاريع: {$projectTitles}",
                    'registration_submitted',
                    'project',
                    $projects->first()->id
                );
            }

            return $request->load(['projectRegistrations.project', 'studentGroup', 'submitter']);
        });
    }

    /**
     * Approve a project registration
     */
    public function approveRegistration(ProjectRegistration $registration, User $reviewer): ProjectRegistration
    {
        if ($registration->status !== 'pending') {
            throw new \Exception('Registration is not pending approval');
        }

        return DB::transaction(function () use ($registration, $reviewer) {
            $project = $registration->project;

            // Check if this registration is from a group by finding the student's active group
            $studentGroup = \App\Models\StudentGroup::where(function ($query) use ($registration) {
                $query->where('leader_id', $registration->student_id)
                    ->orWhereHas('members', function ($q) use ($registration) {
                        $q->where('users.id', $registration->student_id);
                    });
            })->where('status', 'active')->first();

            // Constraint: Max projects per group (from system settings)
            if ($studentGroup) {
                $maxProjectsPerGroup = app(\App\Services\SettingsService::class)->getMaxProjectsPerGroup();
                $approvedCount = $studentGroup->assignedProjects()
                    ->where('id', '!=', $project->id)
                    ->whereIn('status', [\App\Enums\ProjectStatus::IN_PROGRESS->value, \App\Enums\ProjectStatus::COMPLETED->value])
                    ->count();

                if ($approvedCount >= $maxProjectsPerGroup) {
                    $existing = $studentGroup->assignedProjects()
                        ->where('id', '!=', $project->id)
                        ->whereIn('status', [\App\Enums\ProjectStatus::IN_PROGRESS->value, \App\Enums\ProjectStatus::COMPLETED->value])
                        ->first();
                    throw new \Exception("Group already has the maximum allowed approved project(s) ({$maxProjectsPerGroup}). Only {$maxProjectsPerGroup} project(s) can be approved per group.");
                }
            }

            // Check if this registration belongs to a group registration request
            if ($registration->group_registration_request_id) {
                $request = $registration->groupRegistrationRequest;

                // Reject/cancel all other registrations in the same request
                $otherRegistrations = ProjectRegistration::where('group_registration_request_id', $request->id)
                    ->where('id', '!=', $registration->id)
                    ->get();

                foreach ($otherRegistrations as $otherReg) {
                    $otherReg->update(['status' => 'rejected']);
                }

                // Update the request status
                $request->update([
                    'status' => 'approved',
                    'approved_project_id' => $project->id,
                    'reviewed_by' => $reviewer->id,
                    'reviewed_at' => now(),
                ]);
            }

            $registration->update([
                'status' => 'approved',
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
            ]);

            if ($studentGroup) {
                // This is a group registration - attach all group members
                $groupMembers = $studentGroup->members()->pluck('users.id')->push($studentGroup->leader_id)->unique();

                foreach ($groupMembers as $memberId) {
                    if (!$project->students()->where('users.id', $memberId)->exists()) {
                        $project->students()->attach($memberId);
                        $project->increment('current_students');

                        // Create approved registration records for all members
                        ProjectRegistration::updateOrCreate(
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
                // Per specification: When a group registration is approved, the project becomes reserved for that group
                $project->update([
                    'assigned_group_id' => $studentGroup->id,
                    'reserved_at' => now(),
                    'status' => \App\Enums\ProjectStatus::IN_PROGRESS->value,
                ]);
            } else {
                // Registration without group is not allowed per specification
                // All registrations must be through groups
                throw new \Exception('Registration requires a student group. Individual registration is not allowed.');
            }

            return $registration->fresh();
        });
    }

    /**
     * Reject a project registration
     */
    public function rejectRegistration(ProjectRegistration $registration, User $reviewer, string $comments): ProjectRegistration
    {
        if ($registration->status !== 'pending') {
            throw new \Exception('Registration is not pending approval');
        }

        $registration->update([
            'status' => 'rejected',
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'review_comments' => $comments,
        ]);

        return $registration->fresh();
    }

    /**
     * Announce projects (make them available for registration)
     */
    public function announceProjects(array $projectIds): array
    {
        $projects = Project::whereIn('id', $projectIds)
            ->where('status', \App\Enums\ProjectStatus::DRAFT->value)
            ->get();

        foreach ($projects as $project) {
            $project->update(['status' => \App\Enums\ProjectStatus::AVAILABLE_FOR_REGISTRATION->value]);
        }

        return $projects->toArray();
    }

    /**
     * Assign supervisor to project
     * @param bool $requiresApproval If false, supervisor is directly assigned and approval status is set to 'approved'
     */
    public function assignSupervisor(Project $project, User $supervisor, bool $requiresApproval = false): Project
    {
        if (!$supervisor->isSupervisor()) {
            throw new \Exception('User is not a supervisor');
        }

        if ($project->supervisor_id && $project->supervisor_id !== $supervisor->id) {
            throw new \Exception('Project already has a supervisor assigned');
        }

        // Enforce max projects per supervisor (only when assigning a different supervisor)
        if ($project->supervisor_id !== $supervisor->id) {
            $maxProjects = app(\App\Services\SettingsService::class)->getSupervisorMaxProjects();
            $currentCount = $supervisor->supervisedProjects()->where('projects.id', '!=', $project->id)->count();
            if ($currentCount >= $maxProjects) {
                throw new \Exception("Supervisor has reached the maximum number of projects ({$maxProjects}). They cannot be assigned to more projects.");
            }
        }

        $project->update([
            'supervisor_id' => $supervisor->id,
            'supervisor_approval_status' => $requiresApproval ? 'pending' : 'approved',
            'supervisor_approval_at' => $requiresApproval ? null : now(),
        ]);

        return $project->fresh();
    }

    /**
     * Approve supervisor assignment
     */
    public function approveSupervisorAssignment(Project $project, User $supervisor, ?string $comments = null): Project
    {
        if ($project->supervisor_id !== $supervisor->id) {
            throw new \Exception('You are not assigned to this project');
        }

        if ($project->supervisor_approval_status !== 'pending') {
            throw new \Exception('This assignment is not pending approval');
        }

        return DB::transaction(function () use ($project, $comments) {
            $project->update([
                'supervisor_approval_status' => 'approved',
                'supervisor_approval_comments' => $comments,
                'supervisor_approval_at' => now(),
            ]);

            return $project->fresh();
        });
    }

    /**
     * Reject supervisor assignment
     */
    public function rejectSupervisorAssignment(Project $project, User $supervisor, ?string $comments = null): Project
    {
        if ($project->supervisor_id !== $supervisor->id) {
            throw new \Exception('You are not assigned to this project');
        }

        if ($project->supervisor_approval_status !== 'pending') {
            throw new \Exception('This assignment is not pending approval');
        }

        return DB::transaction(function () use ($project, $comments) {
            $project->update([
                'supervisor_approval_status' => 'rejected',
                'supervisor_approval_comments' => $comments,
                'supervisor_approval_at' => now(),
                'supervisor_id' => null, // Remove supervisor assignment
            ]);

            return $project->fresh();
        });
    }

    /**
     * Remove supervisor from project (committee unassign).
     * Ensures single-supervisor constraint: after unassign, project has none and can be assigned another.
     */
    public function removeSupervisor(Project $project): Project
    {
        if (!$project->supervisor_id) {
            throw new \Exception('Project has no supervisor assigned');
        }

        $project->update([
            'supervisor_id' => null,
            'supervisor_approval_status' => null,
            'supervisor_approval_comments' => null,
            'supervisor_approval_at' => null,
        ]);

        return $project->fresh();
    }

    /**
     * Get projects without supervisor
     */
    public function getProjectsWithoutSupervisor(): \Illuminate\Database\Eloquent\Collection
    {
        return Project::whereNull('supervisor_id')
            ->where('status', \App\Enums\ProjectStatus::DRAFT->value)
            ->with(['supervisor', 'students'])
            ->get();
    }

    /**
     * Calculate progress percentage for a project based on multiple factors:
     * - Milestones completion (40% weight)
     * - Document approvals (30% weight)
     * - Defense stages completion (30% weight)
     */
    public function calculateProgressPercentage(Project $project): int
    {
        $weights = [
            'milestones' => 40,
            'documents' => 30,
            'defenses' => 30,
        ];

        $scores = [
            'milestones' => 0,
            'documents' => 0,
            'defenses' => 0,
        ];

        // 1. Calculate milestone progress (40%)
        $totalMilestones = $project->milestones()->count();
        if ($totalMilestones > 0) {
            $completedMilestones = $project->milestones()->where('completed', true)->count();
            $scores['milestones'] = ($completedMilestones / $totalMilestones) * 100;
        }

        // 2. Calculate document approval progress (30%)
        // Count approved documents vs total submitted documents
        $totalDocuments = $project->documents()->count();
        if ($totalDocuments > 0) {
            $approvedDocuments = $project->documents()->where('review_status', 'approved')->count();
            $scores['documents'] = ($approvedDocuments / $totalDocuments) * 100;
        }

        // 3. Calculate defense stages progress (30%)
        // Check FD1 and FD2 completion (published status means completed)
        $fd1Approval = $project->defenseApprovals()
            ->where('defense_stage', 'fd1')
            ->first();
        $fd2Approval = $project->defenseApprovals()
            ->where('defense_stage', 'fd2')
            ->first();

        $defenseProgress = 0;
        if ($fd1Approval && $fd1Approval->isPublished()) {
            $defenseProgress += 50; // FD1 completed = 50%
        }
        if ($fd2Approval && $fd2Approval->isPublished()) {
            $defenseProgress += 50; // FD2 completed = 50%
        }
        $scores['defenses'] = $defenseProgress;

        // Calculate weighted average
        $totalProgress = 0;
        $totalWeight = 0;

        foreach ($scores as $category => $score) {
            // Only include categories that have data
            if ($category === 'milestones' && $totalMilestones > 0) {
                $totalProgress += $score * ($weights[$category] / 100);
                $totalWeight += $weights[$category];
            } elseif ($category === 'documents' && $totalDocuments > 0) {
                $totalProgress += $score * ($weights[$category] / 100);
                $totalWeight += $weights[$category];
            } elseif ($category === 'defenses') {
                // Always include defense stages in calculation
                $totalProgress += $score * ($weights[$category] / 100);
                $totalWeight += $weights[$category];
            }
        }

        // If no data exists at all, return 0
        if ($totalWeight === 0) {
            return 0;
        }

        // Normalize to 100% scale
        $finalProgress = ($totalProgress / $totalWeight) * 100;

        return (int) round(min(100, max(0, $finalProgress)));
    }
}

