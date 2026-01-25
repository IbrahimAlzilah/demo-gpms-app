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
        // Validate change_supervisor requests: only group leaders can submit
        // Get project_id from data or from student's group
        $projectId = $data['project_id'] ?? null;
        
        if ($data['type'] === 'change_supervisor') {
            // If project_id not provided, try to get it from student's group
            if (!$projectId) {
                $studentGroup = \App\Models\StudentGroup::where('leader_id', $student->id)
                    ->where('status', 'active')
                    ->first();
                if ($studentGroup) {
                    // Find project that has this group assigned
                    $project = \App\Models\Project::where('assigned_group_id', $studentGroup->id)->first();
                    if ($project) {
                        $projectId = $project->id;
                    }
                }
            }
            
            if (!$projectId) {
                throw new \Exception('Project ID is required for change supervisor requests. You must be a group leader of a project.');
            }

            $project = \App\Models\Project::with('assignedGroup')->find($projectId);
            if (!$project) {
                throw new \Exception('Project not found');
            }

            if (!$project->assignedGroup) {
                throw new \Exception('Project does not have a group. Change supervisor requests can only be submitted by group leaders.');
            }

            if ($project->assignedGroup->leader_id !== $student->id) {
                throw new \Exception('Only the group leader can submit change supervisor requests');
            }
        }

        $finalProjectId = $projectId;

        $request = ProjectRequest::create([
            'type' => $data['type'],
            'student_id' => $student->id,
            'project_id' => $finalProjectId,
            'reason' => $data['reason'],
            'status' => 'pending',
            'additional_data' => $data['additional_data'] ?? null,
        ]);

        // UC-ST-05: Notify Projects Committee when request is submitted
        if ($this->notificationService) {
            $requestTypeLabel = match($request->type) {
                'change_supervisor' => 'تغيير مشرف',
                'change_group' => 'تغيير مجموعة',
                'change_project' => 'تغيير مشروع',
                default => 'طلب آخر',
            };
            
            $projectTitle = $request->project_id 
                ? (\App\Models\Project::find($request->project_id)?->title ?? '')
                : '';
            
            $message = $projectTitle 
                ? "طلب جديد من الطالب {$student->name}: {$requestTypeLabel} - {$projectTitle}"
                : "طلب جديد من الطالب {$student->name}: {$requestTypeLabel}";
            
            // Notify all Projects Committee members
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
     * @deprecated Supervisor approval is no longer used. All requests must go through Projects Committee.
     * This method is kept for backward compatibility but should not be used in new code.
     */
    public function approveBySupervisor(ProjectRequest $request, User $supervisor, ?string $comments = null): ProjectRequest
    {
        throw new \Exception('Supervisor approval is no longer supported. All requests must be processed by the Projects Committee.');
    }

    /**
     * @deprecated Supervisor rejection is no longer used. All requests must go through Projects Committee.
     * This method is kept for backward compatibility but should not be used in new code.
     */
    public function rejectBySupervisor(ProjectRequest $request, User $supervisor, ?string $comments = null): ProjectRequest
    {
        throw new \Exception('Supervisor rejection is no longer supported. All requests must be processed by the Projects Committee.');
    }

    /**
     * Approve request by committee
     */
    public function approveByCommittee(ProjectRequest $request, User $committeeMember, ?string $comments = null): ProjectRequest
    {
        if ($request->status !== RequestStatus::PENDING) {
            throw new \Exception('Request must be in pending status');
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

            // Notify student about approval
            if ($this->notificationService && $request->student) {
                $requestTypeLabel = match($request->type) {
                    'change_supervisor' => 'تغيير المشرف',
                    'change_group' => 'تغيير المجموعة',
                    'change_project' => 'تغيير المشروع',
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
     * Reject request by committee
     */
    public function rejectByCommittee(ProjectRequest $request, User $committeeMember, ?string $comments = null): ProjectRequest
    {
        if ($request->status !== RequestStatus::PENDING) {
            throw new \Exception('Request must be in pending status');
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
            default => null,
        };
    }

    /**
     * Process change supervisor request - remove supervisor from project
     * The project will then be available for supervisor assignment through the Supervisor Assignment flow
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

        // Remove supervisor from project - this makes it available for reassignment
        $project->update([
            'supervisor_id' => null,
            'supervisor_approval_status' => null,
            'supervisor_approval_comments' => null,
            'supervisor_approval_at' => null,
        ]);
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

