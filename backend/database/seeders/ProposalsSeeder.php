<?php

namespace Database\Seeders;

use App\Enums\ProposalStatus;
use App\Models\Project;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProposalsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $supervisors = User::where('role', 'supervisor')->get();
        $projectsCommitteeMembers = User::where('role', 'projects_committee')->get();
        $students = User::where('role', 'student')->get();

        // Identify students already in projects
        // We use the DB facade to check the pivot table directly as User model might not have 'projects' relation defined
        $assignedStudentIds = \Illuminate\Support\Facades\DB::table('project_student')->pluck('student_id')->toArray();

        $unassignedStudents = $students->whereNotIn('id', $assignedStudentIds)->values();

        // 1. Create Approved Proposals for Projects (Backfill)
        // Find projects that HAVE students
        $projectsWithStudents = Project::whereHas('students')->with('students')->get();
        $approvedProposals = collect();

        foreach ($projectsWithStudents as $project) {
            $projectStudents = $project->students;
            if ($projectStudents->isEmpty()) continue;

            $submitter = $projectStudents->first(); // Leader
            
            $proposal = Proposal::factory()
                ->create([
                    'status' => ProposalStatus::APPROVED,
                    'submitter_id' => $submitter->id,
                    'proposed_supervisor_id' => $project->supervisor_id ?? $supervisors->random()->id,
                    'team_members' => $projectStudents->pluck('id')->toArray(),
                    'project_id' => $project->id,
                    'reviewed_by' => $projectsCommitteeMembers->random()->id,
                    'reviewed_at' => now(),
                    'title' => 'Proposal for ' . $project->title,
                    'description' => 'Approved proposal description for project: ' . $project->title,
                ]);

            $approvedProposals->push($proposal);
        }

        // 2. Create Pending/Rejected Proposals using UNASSIGNED students
        // We will group remaining students into small teams or individuals
        $pendingProposals = collect();
        $rejectedProposals = collect();
        $modificationProposals = collect();

        if ($unassignedStudents->isNotEmpty()) {
            // chunk students into groups of 1-2
            $chunks = $unassignedStudents->chunk(2);
            
            foreach ($chunks as $index => $chunk) {
                // Alternating statuses for variety
                // 0: Pending, 1: Rejected, 2: Requires Modification, ...
                
                $submitter = $chunk->first();
                $teamIds = $chunk->pluck('id')->toArray();
                
                if ($index % 3 === 0) {
                    // Pending
                    $proposal = Proposal::factory()->create([
                        'status' => ProposalStatus::PENDING_REVIEW,
                        'submitter_id' => $submitter->id,
                        'proposed_supervisor_id' => $supervisors->random()->id,
                        'team_members' => $teamIds,
                        'title' => 'Pending Proposal ' . ($index + 1),
                    ]);
                    $pendingProposals->push($proposal);
                } elseif ($index % 3 === 1) {
                    // Rejected
                    $proposal = Proposal::factory()->create([
                        'status' => ProposalStatus::REJECTED,
                        'submitter_id' => $submitter->id,
                        'proposed_supervisor_id' => $supervisors->random()->id,
                        'team_members' => $teamIds,
                        'reviewed_by' => $projectsCommitteeMembers->random()->id,
                        'reviewed_at' => now(),
                        'title' => 'Rejected Proposal ' . ($index + 1),
                    ]);
                    $rejectedProposals->push($proposal);
                } else {
                    // Requires Modification
                    $proposal = Proposal::factory()->create([
                        'status' => ProposalStatus::REQUIRES_MODIFICATION,
                        'submitter_id' => $submitter->id,
                        'proposed_supervisor_id' => $supervisors->random()->id,
                        'team_members' => $teamIds,
                        'reviewed_by' => $projectsCommitteeMembers->random()->id,
                        'reviewed_at' => now(),
                        'review_notes' => fake()->paragraph(),
                        'title' => 'Proposal needing modification ' . ($index + 1),
                    ]);
                    $modificationProposals->push($proposal);
                }
            }
        }

        $this->command->info('Created proposals:');
        $this->command->info('- ' . $approvedProposals->count() . ' approved (linked to projects)');
        $this->command->info('- ' . $pendingProposals->count() . ' pending');
        $this->command->info('- ' . $rejectedProposals->count() . ' rejected');
        $this->command->info('- ' . $modificationProposals->count() . ' requiring modification');
    }
}
