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

        if ($supervisors->isEmpty() || $projectsCommitteeMembers->isEmpty()) {
            $this->command->warn('Not enough users to create proposals. Ensure UsersSeeder runs first.');
            return;
        }

        $pendingProposals = collect();

        // Create ~8 proposals total, all with 'pending review' status
        // All proposals are submitted by supervisors

        // Supervisor-submitted proposals (8 proposals)
        $supervisorSubmitters = $supervisors->take(8);
        foreach ($supervisorSubmitters as $supervisor) {
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
        }

        $this->command->info('Created proposals:');
        $this->command->info('- ' . $pendingProposals->count() . ' pending review');
        $this->command->info('Total: ' . $pendingProposals->count() . ' proposals');
    }
}
