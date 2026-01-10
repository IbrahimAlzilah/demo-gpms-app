<?php

namespace App\Services;

use App\Models\ProjectRequest;
use App\Models\User;
use App\Enums\RequestStatus;
use Illuminate\Support\Facades\DB;

class RequestService
{
    public function __construct(
        protected ?NotificationService $notificationService = null
    ) {
        // Allow nullable for backward compatibility, but initialize if available
        $this->notificationService = $this->notificationService ?? app(NotificationService::class);
    }

    /**
     * Create a new request
     */
    public function create(array $data, User $student): ProjectRequest
    {
        $request = ProjectRequest::create([
            'type' => $data['type'],
            'student_id' => $student->id,
            'project_id' => $data['project_id'] ?? null,
            'reason' => $data['reason'],
            'status' => 'pending',
            'additional_data' => $data['additional_data'] ?? null,
        ]);

        // UC-ST-05: Notify supervisor when request is submitted
        if ($request->project_id && $this->notificationService) {
            $project = \App\Models\Project::find($request->project_id);
            if ($project && $project->supervisor_id) {
                $supervisor = User::find($project->supervisor_id);
                if ($supervisor) {
                    $requestTypeLabel = match($request->type) {
                        'change_supervisor' => 'تغيير مشرف',
                        'change_group' => 'تغيير مجموعة',
                        'change_project' => 'تغيير مشروع',
                        default => 'طلب آخر',
                    };
                    $this->notificationService->create(
                        $supervisor,
                        "طلب جديد من الطالب {$student->name}: {$requestTypeLabel} - {$project->title}",
                        'request_submitted',
                        'request',
                        $request->id
                    );
                }
            }
        }

        return $request;
    }

    /**
     * Approve request by supervisor
     */
    public function approveBySupervisor(ProjectRequest $request, User $supervisor, ?string $comments = null): ProjectRequest
    {
        if ($request->status !== RequestStatus::PENDING) {
            throw new \Exception('Request is not in pending status');
        }

        return DB::transaction(function () use ($request, $supervisor, $comments) {
            $request->update([
                'status' => RequestStatus::SUPERVISOR_APPROVED->value,
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
        if ($request->status !== RequestStatus::PENDING) {
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
        if ($request->status !== RequestStatus::SUPERVISOR_APPROVED) {
            throw new \Exception('Request must be approved by supervisor first');
        }

        return DB::transaction(function () use ($request, $committeeMember, $comments) {
            $request->update([
                'status' => RequestStatus::COMMITTEE_APPROVED->value,
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
        if ($request->status !== RequestStatus::SUPERVISOR_APPROVED) {
            throw new \Exception('Request must be approved by supervisor first');
        }

        $request->update([
            'status' => RequestStatus::COMMITTEE_REJECTED->value,
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
     * Update a request (only if pending)
     */
    public function update(ProjectRequest $request, array $data, User $student): ProjectRequest
    {
        if ($request->student_id !== $student->id) {
            throw new \Exception('Unauthorized to update this request');
        }

        if ($request->status !== RequestStatus::PENDING) {
            throw new \Exception('Can only update requests with pending status');
        }

        $updateData = [];
        if (isset($data['type'])) {
            $updateData['type'] = $data['type'];
        }
        if (isset($data['project_id'])) {
            $updateData['project_id'] = $data['project_id'];
        }
        if (isset($data['reason'])) {
            $updateData['reason'] = $data['reason'];
        }
        if (isset($data['additional_data'])) {
            $updateData['additional_data'] = $data['additional_data'];
        }

        if (empty($updateData)) {
            throw new \Exception('No data provided to update');
        }

        $request->update($updateData);

        return $request->fresh();
    }

    /**
     * Delete a request (only if pending)
     */
    public function delete(ProjectRequest $request, User $student): bool
    {
        if ($request->student_id !== $student->id) {
            throw new \Exception('Unauthorized to delete this request');
        }

        if ($request->status !== RequestStatus::PENDING) {
            throw new \Exception('Can only delete requests with pending status');
        }

        return $request->delete();
    }

    /**
     * Cancel a request
     */
    public function cancel(ProjectRequest $request, User $student): ProjectRequest
    {
        if ($request->student_id !== $student->id) {
            throw new \Exception('Unauthorized to cancel this request');
        }

        if (!in_array($request->status, [RequestStatus::PENDING, RequestStatus::SUPERVISOR_APPROVED])) {
            throw new \Exception('Cannot cancel request in current status');
        }

        $request->update(['status' => RequestStatus::CANCELLED->value]);

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

