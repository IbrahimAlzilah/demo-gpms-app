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
        $students = User::where('role', 'student')->get();
        $supervisors = User::where('role', 'supervisor')->get();
        $projectsCommitteeMembers = User::where('role', 'projects_committee')->get();
        $projects = Project::all();

        // Create pending proposals from students (only if we don't have enough)
        $existingPendingCount = Proposal::where('status', ProposalStatus::PENDING_REVIEW)->count();
        $pendingToCreate = max(0, 10 - $existingPendingCount);
        $pendingProposals = collect();
        if ($pendingToCreate > 0) {
            $pendingProposals = Proposal::factory()
                ->count($pendingToCreate)
                ->pending()
                ->create();
        }

        foreach ($pendingProposals as $proposal) {
            $proposal->update([
                'submitter_id' => $students->random()->id,
                'proposed_supervisor_id' => $supervisors->random()->id,
                'team_members' => $students->random(fake()->numberBetween(1, 3))->pluck('id')->toArray(),
            ]);
        }

        // Create approved proposals linked to projects
        $approvedProposals = collect();
        foreach ($projects->take(8) as $project) {
            $proposal = Proposal::factory()
                ->create([
                    'status' => ProposalStatus::APPROVED,
                    'submitter_id' => $students->random()->id,
                    'proposed_supervisor_id' => $project->supervisor_id,
                    'team_members' => $project->students->pluck('id')->toArray(),
                    'project_id' => $project->id,
                    'reviewed_by' => $projectsCommitteeMembers->random()->id,
                    'reviewed_at' => now(),
                ]);

            $approvedProposals->push($proposal);
        }

        // Create some rejected proposals
        $rejectedProposals = Proposal::factory()
            ->count(3)
            ->create([
                'status' => ProposalStatus::REJECTED,
                'submitter_id' => $students->random()->id,
                'proposed_supervisor_id' => $supervisors->random()->id,
                'reviewed_by' => $projectsCommitteeMembers->random()->id,
                'reviewed_at' => now(),
            ]);

        // Create some requiring modification
        $modificationProposals = Proposal::factory()
            ->count(4)
            ->create([
                'status' => ProposalStatus::REQUIRES_MODIFICATION,
                'submitter_id' => $students->random()->id,
                'proposed_supervisor_id' => $supervisors->random()->id,
                'reviewed_by' => $projectsCommitteeMembers->random()->id,
                'reviewed_at' => now(),
                'review_notes' => fake()->paragraph(),
            ]);

        $this->command->info('Created proposals:');
        $this->command->info('- ' . $pendingProposals->count() . ' pending');
        $this->command->info('- ' . $approvedProposals->count() . ' approved');
        $this->command->info('- ' . $rejectedProposals->count() . ' rejected');
        $this->command->info('- ' . $modificationProposals->count() . ' requiring modification');
    }
}
