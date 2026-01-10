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
        return Project::create([
            'title' => $data['title'],
            'description' => $data['description'],
            'status' => \App\Enums\ProjectStatus::DRAFT->value,
            'supervisor_id' => $data['supervisor_id'] ?? null,
            'max_students' => $data['max_students'] ?? 4,
            'current_students' => 0,
            'specialization' => $data['specialization'] ?? null,
            'keywords' => $data['keywords'] ?? [],
        ]);
    }

    /**
     * Register a student to a project
     */
    public function registerStudent(Project $project, User $student): ProjectRegistration
    {
        if (!$project->isAvailableForRegistration()) {
            throw new \Exception('Project is not available for registration');
        }

        if ($project->students()->where('users.id', $student->id)->exists()) {
            throw new \Exception('Student is already registered to this project');
        }

        // Check if student already has a pending registration for this project
        $existingRegistration = ProjectRegistration::where('student_id', $student->id)
            ->where('project_id', $project->id)
            ->where('status', 'pending')
            ->first();

        if ($existingRegistration) {
            throw new \Exception('You already have a pending registration for this project');
        }

        // Check if student already has a pending registration for any project
        $hasPendingRegistration = ProjectRegistration::where('student_id', $student->id)
            ->where('status', 'pending')
            ->exists();

        if ($hasPendingRegistration) {
            throw new \Exception('You already have a pending registration for another project');
        }

        // Check if student is already registered in an approved project
        $hasApprovedProject = Project::whereHas('students', function ($query) use ($student) {
            $query->where('users.id', $student->id);
        })->exists();

        if ($hasApprovedProject) {
            throw new \Exception('You are already registered in another project');
        }

        return DB::transaction(function () use ($project, $student) {
            $registration = ProjectRegistration::create([
                'project_id' => $project->id,
                'student_id' => $student->id,
                'status' => 'pending',
                'submitted_at' => now(),
            ]);

            // UC-ST-03: Notify projects committee about new registration
            $committeeMembers = User::where('role', 'projects_committee')
                ->where('status', 'active')
                ->pluck('id')
                ->toArray();

            if (!empty($committeeMembers) && $this->notificationService) {
                $this->notificationService->createForUsers(
                    $committeeMembers,
                    "طلب تسجيل جديد من الطالب {$student->name} في المشروع: {$project->title}",
                    'registration_submitted',
                    'project',
                    $project->id
                );
            }

            return $registration;
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
            $registration->update([
                'status' => 'approved',
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
            ]);

            $project = $registration->project;
            
            // Only attach if not already attached
            if (!$project->students()->where('users.id', $registration->student_id)->exists()) {
                $project->students()->attach($registration->student_id);
                $project->increment('current_students');
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
     */
    public function assignSupervisor(Project $project, User $supervisor): Project
    {
        if (!$supervisor->isSupervisor()) {
            throw new \Exception('User is not a supervisor');
        }

        $project->update([
            'supervisor_id' => $supervisor->id,
            'supervisor_approval_status' => 'pending',
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
     * Calculate progress percentage for a project based on completed milestones
     */
    public function calculateProgressPercentage(Project $project): int
    {
        $totalMilestones = $project->milestones()->count();

        if ($totalMilestones === 0) {
            return 0;
        }

        $completedMilestones = $project->milestones()->where('completed', true)->count();

        return (int) round(($completedMilestones / $totalMilestones) * 100);
    }
}

