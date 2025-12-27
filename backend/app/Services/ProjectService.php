<?php

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use App\Models\ProjectRegistration;
use Illuminate\Support\Facades\DB;

class ProjectService
{
    /**
     * Create a new project from a proposal
     */
    public function createFromProposal(array $data, ?int $proposalId = null): Project
    {
        return Project::create([
            'title' => $data['title'],
            'description' => $data['description'],
            'status' => 'approved',
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

        return DB::transaction(function () use ($project, $student) {
            $registration = ProjectRegistration::create([
                'project_id' => $project->id,
                'student_id' => $student->id,
                'status' => 'pending',
                'submitted_at' => now(),
            ]);

            return $registration;
        });
    }

    /**
     * Approve a project registration
     */
    public function approveRegistration(ProjectRegistration $registration, User $reviewer): ProjectRegistration
    {
        return DB::transaction(function () use ($registration, $reviewer) {
            $registration->update([
                'status' => 'approved',
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
            ]);

            $project = $registration->project;
            $project->students()->attach($registration->student_id);
            $project->increment('current_students');

            return $registration->fresh();
        });
    }

    /**
     * Announce projects (make them available for registration)
     */
    public function announceProjects(array $projectIds): array
    {
        $projects = Project::whereIn('id', $projectIds)
            ->where('status', 'approved')
            ->get();

        foreach ($projects as $project) {
            $project->update(['status' => 'available_for_registration']);
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

        $project->update(['supervisor_id' => $supervisor->id]);

        return $project->fresh();
    }

    /**
     * Get projects without supervisor
     */
    public function getProjectsWithoutSupervisor(): \Illuminate\Database\Eloquent\Collection
    {
        return Project::whereNull('supervisor_id')
            ->where('status', 'approved')
            ->with(['supervisor', 'students'])
            ->get();
    }
}

