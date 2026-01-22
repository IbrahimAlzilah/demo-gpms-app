<?php

namespace Database\Seeders;

use App\Enums\ProposalStatus;
use App\Models\Proposal;
use App\Models\User;
use Database\Seeders\helpers\YemeniDataHelper;
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

        if ($supervisors->isEmpty() || $students->isEmpty() || $projectsCommitteeMembers->isEmpty()) {
            $this->command->warn('Not enough users to create proposals. Ensure UsersSeeder runs first.');
            return;
        }

        $pendingProposals = collect();
        $rejectedProposals = collect();
        $modificationProposals = collect();

        // Create ~8 proposals total with variety
        // Mix of student-submitted and supervisor-submitted proposals
        // Mix of statuses: pending, rejected, requires_modification

        // 1. Student-submitted proposals (5 proposals)
        $studentSubmitters = $students->take(5);
        foreach ($studentSubmitters as $index => $student) {
            $statusIndex = $index % 3;

            if ($statusIndex === 0) {
                // Pending review
                $proposal = Proposal::create([
                    'title' => YemeniDataHelper::yemeniProposalTitle(),
                    'description' => YemeniDataHelper::yemeniProposalDescription(),
                    'submitter_id' => $student->id,
                    'proposed_supervisor_id' => $supervisors->random()->id,
                    'team_members' => null,
                    'status' => ProposalStatus::PENDING_REVIEW,
                    'reviewed_by' => null,
                    'reviewed_at' => null,
                    'review_notes' => null,
                    'project_id' => null,
                    'student_group_id' => null,
                    'target_project_id' => null,
                ]);
                $pendingProposals->push($proposal);
            } elseif ($statusIndex === 1) {
                // Rejected
                $proposal = Proposal::create([
                    'title' => YemeniDataHelper::yemeniProposalTitle(),
                    'description' => YemeniDataHelper::yemeniProposalDescription(),
                    'submitter_id' => $student->id,
                    'proposed_supervisor_id' => $supervisors->random()->id,
                    'team_members' => null,
                    'status' => ProposalStatus::REJECTED,
                    'reviewed_by' => $projectsCommitteeMembers->random()->id,
                    'reviewed_at' => now()->subDays(fake()->numberBetween(1, 7)),
                    'review_notes' => fake()->paragraph(),
                    'project_id' => null,
                    'student_group_id' => null,
                    'target_project_id' => null,
                ]);
                $rejectedProposals->push($proposal);
            } else {
                // Requires modification
                $proposal = Proposal::create([
                    'title' => YemeniDataHelper::yemeniProposalTitle(),
                    'description' => YemeniDataHelper::yemeniProposalDescription(),
                    'submitter_id' => $student->id,
                    'proposed_supervisor_id' => $supervisors->random()->id,
                    'team_members' => null,
                    'status' => ProposalStatus::REQUIRES_MODIFICATION,
                    'reviewed_by' => $projectsCommitteeMembers->random()->id,
                    'reviewed_at' => now()->subDays(fake()->numberBetween(1, 7)),
                    'review_notes' => fake()->paragraph(),
                    'project_id' => null,
                    'student_group_id' => null,
                    'target_project_id' => null,
                ]);
                $modificationProposals->push($proposal);
            }
        }

        // 2. Supervisor-submitted proposals (3 proposals)
        $supervisorSubmitters = $supervisors->take(3);
        foreach ($supervisorSubmitters as $index => $supervisor) {
            $statusIndex = $index % 2; // Only pending or requires_modification for supervisors

            if ($statusIndex === 0) {
                // Pending review
                $proposal = Proposal::create([
                    'title' => YemeniDataHelper::yemeniProposalTitle(),
                    'description' => YemeniDataHelper::yemeniProposalDescription(),
                    'submitter_id' => $supervisor->id,
                    'proposed_supervisor_id' => $supervisor->id, // Supervisor proposes themselves
                    'team_members' => null,
                    'status' => ProposalStatus::PENDING_REVIEW,
                    'reviewed_by' => null,
                    'reviewed_at' => null,
                    'review_notes' => null,
                    'project_id' => null,
                    'student_group_id' => null,
                    'target_project_id' => null,
                ]);
                $pendingProposals->push($proposal);
            } else {
                // Requires modification
                $proposal = Proposal::create([
                    'title' => YemeniDataHelper::yemeniProposalTitle(),
                    'description' => YemeniDataHelper::yemeniProposalDescription(),
                    'submitter_id' => $supervisor->id,
                    'proposed_supervisor_id' => $supervisor->id,
                    'team_members' => null,
                    'status' => ProposalStatus::REQUIRES_MODIFICATION,
                    'reviewed_by' => $projectsCommitteeMembers->random()->id,
                    'reviewed_at' => now()->subDays(fake()->numberBetween(1, 7)),
                    'review_notes' => fake()->paragraph(),
                    'project_id' => null,
                    'student_group_id' => null,
                    'target_project_id' => null,
                ]);
                $modificationProposals->push($proposal);
            }
        }

        $this->command->info('Created proposals:');
        $this->command->info('- ' . $pendingProposals->count() . ' pending review');
        $this->command->info('- ' . $rejectedProposals->count() . ' rejected');
        $this->command->info('- ' . $modificationProposals->count() . ' requiring modification');
        $this->command->info('Total: ' . ($pendingProposals->count() + $rejectedProposals->count() + $modificationProposals->count()) . ' proposals');
    }
}
