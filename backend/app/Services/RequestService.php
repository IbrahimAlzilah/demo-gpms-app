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
     * Create a new request.
     * change_supervisor: sent first to current supervisor; after supervisor approval, goes to committee.
     * Other types: sent directly to Projects Committee.
     */
    public function create(array $data, User $student): ProjectRequest
    {
        $projectId = $data['project_id'] ?? null;

        $request = ProjectRequest::create([
            'type' => $data['type'],
            'student_id' => $student->id,
            'project_id' => $projectId,
            'reason' => $data['reason'],
            'status' => 'pending',
            'additional_data' => $data['additional_data'] ?? null,
        ]);

        if (!$this->notificationService) {
            return $request;
        }

        $requestTypeLabel = match($request->type) {
            'change_supervisor' => 'تغيير مشرف',
            'change_group' => 'تغيير مجموعة',
            'change_project' => 'تغيير مشروع',
            'change_project_title' => 'تغيير عنوان المشروع',
            default => 'طلب آخر',
        };

        $projectTitle = $request->project_id
            ? (\App\Models\Project::find($request->project_id)?->title ?? '')
            : '';
        $message = $projectTitle
            ? "طلب جديد من الطالب {$student->name}: {$requestTypeLabel} - {$projectTitle}"
            : "طلب جديد من الطالب {$student->name}: {$requestTypeLabel}";

        if ($request->type === 'change_supervisor' && $request->project_id) {
            $project = \App\Models\Project::find($request->project_id);
            if ($project && $project->supervisor_id) {
                $this->notificationService->create(
                    $project->supervisor,
                    $message,
                    'request_submitted',
                    'request',
                    $request->id
                );
            }
        } else {
            $committeeMembers = User::where('role', 'projects_committee')
                ->where('status', 'active')
                ->get();
            foreach ($committeeMembers as $member) {
                $this->notificationService->create(
                    $member,
                    $message,
                    'request_submitted',
                    'request',
                    $request->id
                );
            }
        }

        return $request;
    }

    /**
     * Approve request by current supervisor (change_supervisor only).
     * Forwards the request to the Projects Committee for final decision.
     */
    public function approveBySupervisor(ProjectRequest $request, User $supervisor, ?string $comments = null): ProjectRequest
    {
        if ($request->type !== 'change_supervisor') {
            throw new \Exception('Only change_supervisor requests can be approved by supervisor.');
        }
        if ($request->status !== RequestStatus::PENDING) {
            throw new \Exception('Request must be in pending status');
        }
        if (!$request->project_id || $request->project->supervisor_id !== $supervisor->id) {
            throw new \Exception('You are not the current supervisor of this project.');
        }

        $request->update([
            'status' => RequestStatus::SUPERVISOR_APPROVED->value,
            'supervisor_approval' => [
                'approved' => true,
                'comments' => $comments,
                'approved_at' => now()->toISOString(),
                'approved_by' => $supervisor->id,
            ],
        ]);

        $committeeMembers = User::where('role', 'projects_committee')->where('status', 'active')->get();
        $student = $request->student;
        $message = "طلب تغيير مشرف من الطالب {$student->name} تمت موافقته من المشرف الحالي وينتظر قرار اللجنة.";
        foreach ($committeeMembers as $member) {
            $this->notificationService?->create($member, $message, 'request_submitted', 'request', $request->id);
        }

        return $request->fresh();
    }

    /**
     * Reject request by current supervisor (change_supervisor only).
     */
    public function rejectBySupervisor(ProjectRequest $request, User $supervisor, ?string $comments = null): ProjectRequest
    {
        if ($request->type !== 'change_supervisor') {
            throw new \Exception('Only change_supervisor requests can be rejected by supervisor.');
        }
        if ($request->status !== RequestStatus::PENDING) {
            throw new \Exception('Request must be in pending status');
        }
        if (!$request->project_id || $request->project->supervisor_id !== $supervisor->id) {
            throw new \Exception('You are not the current supervisor of this project.');
        }

        $request->update([
            'status' => RequestStatus::SUPERVISOR_REJECTED->value,
            'supervisor_approval' => [
                'approved' => false,
                'comments' => $comments,
                'approved_at' => now()->toISOString(),
                'approved_by' => $supervisor->id,
            ],
        ]);

        if ($this->notificationService && $request->student) {
            $this->notificationService->create(
                $request->student,
                'تم رفض طلب تغيير المشرف من قبل المشرف الحالي.' . ($comments ? "\nملاحظات: {$comments}" : ''),
                'request_rejected',
                'request',
                $request->id
            );
        }

        return $request->fresh();
    }

    /**
     * Approve request by committee.
     * Allowed when status is pending (direct committee requests) or supervisor_approved (change_supervisor flow).
     */
    public function approveByCommittee(ProjectRequest $request, User $committeeMember, ?string $comments = null): ProjectRequest
    {
        $allowedStatuses = [RequestStatus::PENDING->value, RequestStatus::SUPERVISOR_APPROVED->value];
        if (!in_array($request->status, $allowedStatuses, true)) {
            throw new \Exception('Request must be in pending or supervisor_approved status');
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

        $this->processRequest($request);

        if ($this->notificationService && $request->student) {
            $requestTypeLabel = match($request->type) {
                'change_supervisor' => 'تغيير المشرف',
                'change_group' => 'تغيير المجموعة',
                'change_project' => 'تغيير المشروع',
                'change_project_title' => 'تغيير عنوان المشروع',
                default => 'الطلب',
            };

                $message = "تم قبول {$requestTypeLabel}";
                if ($comments) {
                    $message .= "\nملاحظات: {$comments}";
                }

            $this->notificationService->create(
                $request->student,
                $message,
                'request_approved',
                'request',
                $request->id
            );
        }

            return $request->fresh();
        });
    }

    /**
     * Reject request by committee.
     * Allowed when status is pending or supervisor_approved.
     */
    public function rejectByCommittee(ProjectRequest $request, User $committeeMember, ?string $comments = null): ProjectRequest
    {
        $allowedStatuses = [RequestStatus::PENDING->value, RequestStatus::SUPERVISOR_APPROVED->value];
        if (!in_array($request->status, $allowedStatuses, true)) {
            throw new \Exception('Request must be in pending or supervisor_approved status');
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

        // Notify student about rejection
        if ($this->notificationService && $request->student) {
            $requestTypeLabel = match($request->type) {
                'change_supervisor' => 'تغيير المشرف',
                'change_group' => 'تغيير المجموعة',
                'change_project' => 'تغيير المشروع',
                'change_project_title' => 'تغيير عنوان المشروع',
                default => 'الطلب',
            };

            $message = "تم رفض {$requestTypeLabel}";
            if ($comments) {
                $message .= "\nملاحظات: {$comments}";
            } else {
                $message .= ". يرجى مراجعة الملاحظات";
            }

            $this->notificationService->create(
                $request->student,
                $message,
                'request_rejected',
                'request',
                $request->id
            );
        }

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

        if ($request->status !== RequestStatus::PENDING) {
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
        match($request->type) {
            'change_supervisor' => $this->processChangeSupervisorRequest($request),
            'change_group' => $this->processChangeGroupRequest($request),
            'change_project' => $this->processChangeProjectRequest($request),
            'change_project_title' => null, // Committee may apply title manually from additional_data
            default => null,
        };
    }

    /**
     * Process change supervisor request: assign proposed supervisor if present, else remove current supervisor.
     */
    private function processChangeSupervisorRequest(ProjectRequest $request): void
    {
        if (!$request->project_id) {
            return;
        }

        $project = \App\Models\Project::find($request->project_id);
        if (!$project) {
            return;
        }

        $additional = $request->additional_data ?? [];
        $proposedId = $additional['proposed_supervisor_id'] ?? null;

        if ($proposedId) {
            $project->update([
                'supervisor_id' => $proposedId,
                'supervisor_approval_status' => null,
                'supervisor_approval_comments' => null,
                'supervisor_approval_at' => null,
            ]);
        } else {
            $project->update([
                'supervisor_id' => null,
                'supervisor_approval_status' => null,
                'supervisor_approval_comments' => null,
                'supervisor_approval_at' => null,
            ]);
        }
    }

    /**
     * Process change group request
     */
    private function processChangeGroupRequest(ProjectRequest $request): void
    {
        // Implementation for change group request
        // This would handle moving a student to a different group
        // TODO: Implement when group management is finalized
    }

    /**
     * Process change project request
     */
    private function processChangeProjectRequest(ProjectRequest $request): void
    {
        // Implementation for change project request
        // This would handle moving a student to a different project
        // TODO: Implement when project transfer logic is finalized
    }
}

