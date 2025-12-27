<?php

namespace App\Services;

use App\Models\ProjectRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RequestService
{
    /**
     * Create a new request
     */
    public function create(array $data, User $student): ProjectRequest
    {
        return ProjectRequest::create([
            'type' => $data['type'],
            'student_id' => $student->id,
            'project_id' => $data['project_id'] ?? null,
            'reason' => $data['reason'],
            'status' => 'pending',
            'additional_data' => $data['additional_data'] ?? null,
        ]);
    }

    /**
     * Approve request by supervisor
     */
    public function approveBySupervisor(ProjectRequest $request, User $supervisor, ?string $comments = null): ProjectRequest
    {
        if ($request->status !== 'pending') {
            throw new \Exception('Request is not in pending status');
        }

        return DB::transaction(function () use ($request, $supervisor, $comments) {
            $request->update([
                'status' => 'supervisor_approved',
                'supervisor_approval' => [
                    'approved' => true,
                    'comments' => $comments,
                    'approved_at' => now()->toISOString(),
                    'approved_by' => $supervisor->id,
                ],
            ]);

            return $request->fresh();
        });
    }

    /**
     * Reject request by supervisor
     */
    public function rejectBySupervisor(ProjectRequest $request, User $supervisor, ?string $comments = null): ProjectRequest
    {
        if ($request->status !== 'pending') {
            throw new \Exception('Request is not in pending status');
        }

        $request->update([
            'status' => 'supervisor_rejected',
            'supervisor_approval' => [
                'approved' => false,
                'comments' => $comments,
                'approved_at' => now()->toISOString(),
                'approved_by' => $supervisor->id,
            ],
        ]);

        return $request->fresh();
    }

    /**
     * Approve request by committee
     */
    public function approveByCommittee(ProjectRequest $request, User $committeeMember, ?string $comments = null): ProjectRequest
    {
        if ($request->status !== 'supervisor_approved') {
            throw new \Exception('Request must be approved by supervisor first');
        }

        return DB::transaction(function () use ($request, $committeeMember, $comments) {
            $request->update([
                'status' => 'committee_approved',
                'committee_approval' => [
                    'approved' => true,
                    'comments' => $comments,
                    'approved_at' => now()->toISOString(),
                    'approved_by' => $committeeMember->id,
                ],
            ]);

            // Process the request based on type
            $this->processRequest($request);

            return $request->fresh();
        });
    }

    /**
     * Reject request by committee
     */
    public function rejectByCommittee(ProjectRequest $request, User $committeeMember, ?string $comments = null): ProjectRequest
    {
        if ($request->status !== 'supervisor_approved') {
            throw new \Exception('Request must be approved by supervisor first');
        }

        $request->update([
            'status' => 'committee_rejected',
            'committee_approval' => [
                'approved' => false,
                'comments' => $comments,
                'approved_at' => now()->toISOString(),
                'approved_by' => $committeeMember->id,
            ],
        ]);

        return $request->fresh();
    }

    /**
     * Cancel a request
     */
    public function cancel(ProjectRequest $request, User $student): ProjectRequest
    {
        if ($request->student_id !== $student->id) {
            throw new \Exception('Unauthorized to cancel this request');
        }

        if (!in_array($request->status, ['pending', 'supervisor_approved'])) {
            throw new \Exception('Cannot cancel request in current status');
        }

        $request->update(['status' => 'cancelled']);

        return $request->fresh();
    }

    /**
     * Process an approved request
     */
    private function processRequest(ProjectRequest $request): void
    {
        // Implementation depends on request type
        // This would handle changing supervisor, project, or group
        // For now, it's a placeholder
    }
}

