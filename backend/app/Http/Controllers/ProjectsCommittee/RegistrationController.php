<?php

namespace App\Http\Controllers\ProjectsCommittee;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectRegistrationResource;
use App\Http\Resources\GroupRegistrationRequestResource;
use App\Http\Resources\StudentGroupResource;
use App\Http\Resources\ProposalResource;
use App\Http\Traits\HasTableQuery;
use App\Models\ProjectRegistration;
use App\Models\GroupRegistrationRequest;
use App\Models\StudentGroup;
use App\Models\Project;
use App\Models\Proposal;
use App\Services\ProjectService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RegistrationController extends Controller
{
    use HasTableQuery;

    public function __construct(
        protected ProjectService $projectService,
        protected NotificationService $notificationService
    ) {}

    /**
     * List project registrations in grouped view only
     * All registrations are displayed as GroupRegistrationRequests
     */
    public function index(Request $request): JsonResponse
    {
        // Authorize: Only Projects Committee can view all registrations
        $this->authorize('viewAny', ProjectRegistration::class);

        // Always return grouped view
        return $this->getGroupedRequests($request);
    }

    /**
     * Get grouped registration requests
     * Returns paginated GroupRegistrationRequest records with nested project registrations
     */
    public function getGroupedRequests(Request $request): JsonResponse
    {
        // Authorize: Only Projects Committee can view all group registration requests
        $this->authorize('viewAny', GroupRegistrationRequest::class);

        $page = (int) $request->get('page', 1);
        $pageSize = (int) $request->get('pageSize', 10);
        $status = $request->get('status');
        $search = $request->get('search');

        // Get GroupRegistrationRequest records with all necessary relationships
        $query = GroupRegistrationRequest::with([
            'studentGroup.leader',
            'studentGroup.members',
            'submitter',
            'reviewer',
            'approvedProject.supervisor',
            'projectRegistrations.project.supervisor',
            'projectRegistrations.student',
            'projectRegistrations.reviewer',
        ]);

        // Filter by status if provided
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('studentGroup', function ($groupQuery) use ($search) {
                    $groupQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('group_code', 'like', "%{$search}%");
                })
                ->orWhereHas('submitter', function ($submitterQuery) use ($search) {
                    $submitterQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhereHas('projectRegistrations.project', function ($projectQuery) use ($search) {
                    $projectQuery->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            });
        }

        // Order by submitted_at descending (newest first)
        $query->orderBy('submitted_at', 'desc');

        $groupedRequests = $query->get();

        // Get legacy registrations (without group_registration_request_id) and group them by student group
        $legacyRegistrationsQuery = ProjectRegistration::with([
            'project.supervisor',
            'student',
            'reviewer',
        ])
            ->whereNull('group_registration_request_id');

        // Filter by status if provided
        if ($status && $status !== 'all') {
            $legacyRegistrationsQuery->where('status', $status);
        }

        // Apply search filter for legacy registrations
        if ($search) {
            $legacyRegistrationsQuery->where(function ($q) use ($search) {
                $q->whereHas('student', function ($studentQuery) use ($search) {
                    $studentQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhereHas('project', function ($projectQuery) use ($search) {
                    $projectQuery->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            });
        }

        $legacyRegistrations = $legacyRegistrationsQuery->orderBy('submitted_at', 'desc')->get();

        // Group legacy registrations by student group
        $legacyGrouped = [];
        foreach ($legacyRegistrations as $registration) {
            // Find the student's group
            $studentGroup = StudentGroup::with(['leader', 'members'])
                ->where(function ($query) use ($registration) {
                    $query->where('leader_id', $registration->student_id)
                        ->orWhereHas('members', function ($q) use ($registration) {
                            $q->where('users.id', $registration->student_id);
                        });
                })
                ->where('status', 'active')
                ->first();

            if ($studentGroup) {
                $groupKey = $studentGroup->id;
                if (!isset($legacyGrouped[$groupKey])) {
                    $legacyGrouped[$groupKey] = [
                        'group' => $studentGroup,
                        'registrations' => [],
                        'leader' => $studentGroup->leader,
                    ];
                }
                $legacyGrouped[$groupKey]['registrations'][] = $registration;
            } else {
                // Log or handle registrations where student has no active group
                \Log::warning('Legacy registration found without active student group', [
                    'registration_id' => $registration->id,
                    'student_id' => $registration->student_id,
                ]);
            }
        }

        // Convert legacy grouped registrations to GroupRegistrationRequest-like structure
        $legacyRequests = [];
        foreach ($legacyGrouped as $groupData) {
            $group = $groupData['group'];
            $registrations = $groupData['registrations'];

            // Create a virtual GroupRegistrationRequest-like object
            $legacyRequest = new \stdClass();
            $legacyRequest->id = 'legacy_' . $group->id;
            $legacyRequest->student_group_id = $group->id;
            $legacyRequest->submitted_by = $group->leader_id;
            $legacyRequest->status = $this->determineLegacyRequestStatus($registrations);
            $legacyRequest->submitted_at = $registrations[0]->submitted_at ?? now();
            $legacyRequest->reviewed_at = $registrations[0]->reviewed_at;
            $legacyRequest->reviewed_by = $registrations[0]->reviewed_by;
            $legacyRequest->review_comments = null;
            $legacyRequest->approved_project_id = $this->getApprovedProjectId($registrations);
            $legacyRequest->created_at = $registrations[0]->created_at ?? now();
            $legacyRequest->updated_at = $registrations[0]->updated_at ?? now();

            // Set relationships
            $legacyRequest->studentGroup = $group;
            $legacyRequest->submitter = $groupData['leader'];
            $legacyRequest->reviewer = $registrations[0]->reviewer;
            $legacyRequest->approvedProject = $this->getApprovedProject($registrations);
            $legacyRequest->projectRegistrations = collect($registrations);

            $legacyRequests[] = $legacyRequest;
        }

        // Merge grouped requests and legacy requests
        // Convert to arrays to avoid getKey() issues with stdClass objects
        $groupedArray = $groupedRequests->all();
        $allRequests = collect(array_merge($groupedArray, $legacyRequests));

        // Sort by submitted_at descending (newest first)
        $allRequests = $allRequests->sortByDesc(function ($request) {
            return $request->submitted_at instanceof \Carbon\Carbon
                ? $request->submitted_at->timestamp
                : strtotime($request->submitted_at ?? '1970-01-01');
        })->values();

        // Paginate
        $total = $allRequests->count();
        $totalPages = ceil($total / $pageSize);
        $offset = ($page - 1) * $pageSize;
        $paginatedRequests = $allRequests->slice($offset, $pageSize);

        return response()->json([
            'success' => true,
            'data' => GroupRegistrationRequestResource::collection($paginatedRequests),
            'pagination' => [
                'page' => $page,
                'pageSize' => $pageSize,
                'total' => $total,
                'totalPages' => $totalPages,
            ],
        ]);
    }



    /**
     * Determine the status of a legacy request based on its registrations
     */
    private function determineLegacyRequestStatus(array $registrations): string
    {
        $hasApproved = collect($registrations)->contains('status', 'approved');
        $hasRejected = collect($registrations)->contains('status', 'rejected');
        $hasPending = collect($registrations)->contains('status', 'pending');

        if ($hasApproved) {
            return 'approved';
        }
        if ($hasRejected && !$hasPending) {
            return 'rejected';
        }
        return 'pending';
    }

    /**
     * Get the approved project ID from registrations
     */
    private function getApprovedProjectId(array $registrations): ?int
    {
        $approved = collect($registrations)->firstWhere('status', 'approved');
        return $approved ? $approved->project_id : null;
    }

    /**
     * Get the approved project from registrations
     */
    private function getApprovedProject(array $registrations): ?Project
    {
        $approved = collect($registrations)->firstWhere('status', 'approved');
        if ($approved) {
            // Load project with supervisor if not already loaded
            if (!$approved->relationLoaded('project') && $approved->project_id) {
                $approved->load(['project.supervisor']);
            } elseif ($approved->relationLoaded('project') && $approved->project && !$approved->project->relationLoaded('supervisor')) {
                $approved->project->load('supervisor');
            }
            return $approved->project;
        }
        return null;
    }

    /**
     * List student groups for manual registration
     * Returns leader info and members count for UI selection.
     */
    public function groups(Request $request): JsonResponse
    {
        $query = StudentGroup::query()
            ->with(['leader:id,name,email'])
            ->withCount('members')
            ->orderBy('id', 'desc');

        // Optional: only groups that are eligible (meets min/max members)
        if ($request->boolean('eligible_only', false)) {
            $minMembers = app(\App\Services\SettingsService::class)->getGroupMinMembers();
            $maxMembers = app(\App\Services\SettingsService::class)->getGroupMaxMembers();

            // members_count is members only; total = members_count + 1 (leader)
            $query->havingRaw('(members_count + 1) >= ? AND (members_count + 1) <= ?', [$minMembers, $maxMembers]);
        }

        $groups = $query->get()->map(function (StudentGroup $group) {
            return [
                'id' => (string) $group->id,
                'name' => $group->name,
                'code' => $group->group_code,
                'leader' => [
                    'id' => (string) ($group->leader?->id),
                    'name' => $group->leader?->name,
                    'email' => $group->leader?->email,
                ],
                'members_count' => (int) ($group->members_count + 1), // include leader for UI
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $groups,
        ]);
    }

    /**
     * Show a specific registration
     */
    public function show(ProjectRegistration $registration): JsonResponse
    {
        $registration->load(['project', 'student', 'reviewer']);

        return response()->json([
            'success' => true,
            'data' => new ProjectRegistrationResource($registration),
        ]);
    }

    /**
     * Manually register a student or student group to a project
     * Project Committee can register students/groups without time window restrictions
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'student_group_id' => 'required|exists:student_groups,id',
            'auto_approve' => 'nullable|boolean',
        ]);

        $project = \App\Models\Project::findOrFail($validated['project_id']);
        $studentGroup = \App\Models\StudentGroup::findOrFail($validated['student_group_id']);

        // Validate group meets registration requirements
        if (!$studentGroup->meetsRegistrationRequirements()) {
            $minMembers = app(\App\Services\SettingsService::class)->getGroupMinMembers();
            $maxMembers = app(\App\Services\SettingsService::class)->getGroupMaxMembers();
            $totalMembers = $studentGroup->getTotalMemberCount();

            return response()->json([
                'success' => false,
                'message' => "Group must have between {$minMembers} and {$maxMembers} members (current: {$totalMembers})",
            ], 422);
        }

        // Check if project is already assigned to another group
        if ($project->assigned_group_id && $project->assigned_group_id !== $studentGroup->id) {
            return response()->json([
                'success' => false,
                'message' => 'Project is already assigned to another group',
            ], 422);
        }

        try {
            // Get all group members
            $groupMembers = $studentGroup->members()->pluck('users.id')->push($studentGroup->leader_id)->unique();

            // Check if any member is already registered in this or another project
            $hasProject = \App\Models\Project::whereHas('students', function ($query) use ($groupMembers) {
                $query->whereIn('users.id', $groupMembers);
            })->exists();

            if ($hasProject) {
                return response()->json([
                    'success' => false,
                    'message' => 'One or more group members are already registered in another project',
                ], 422);
            }

            // Create registration for the group
            $registration = $this->projectService->registerStudentGroup(
                $project,
                $studentGroup,
                $studentGroup->leader // Leader as representative
            );

            // Auto-approve if requested (default behavior for manual registration)
            $autoApprove = $validated['auto_approve'] ?? true;
            if ($autoApprove && $registration->status === 'pending') {
                $registration = $this->projectService->approveRegistration(
                    $registration,
                    $request->user()
                );
            }

            return response()->json([
                'success' => true,
                'data' => new ProjectRegistrationResource($registration->load(['project', 'student', 'reviewer'])),
                'message' => 'Group registered successfully',
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Approve a project registration
     * Supports both individual registration approval and group request approval
     */
    public function approve(Request $request, ProjectRegistration $registration): JsonResponse
    {
        $this->authorize('approve', $registration);

        try {
            $settingsService = app(\App\Services\SettingsService::class);
            $committeeReviewCommentsMaxLength = $settingsService->getCommitteeReviewCommentsMaxLength();

            $validated = $request->validate([
                'comments' => "nullable|string|max:{$committeeReviewCommentsMaxLength}",
            ]);

            $approved = $this->projectService->approveRegistration(
                $registration,
                $request->user()
            );

            // Update review comments if provided
            if (isset($validated['comments'])) {
                $approved->update(['review_comments' => $validated['comments']]);

                // If this is part of a group request, update request comments too
                if ($approved->group_registration_request_id) {
                    $groupRequest = $approved->groupRegistrationRequest;
                    $groupRequest->update(['review_comments' => $validated['comments']]);
                }
            }

            // Notify group leader about approval
            $notificationTarget = $registration->student;
            if ($approved->group_registration_request_id) {
                $groupRequest = $approved->groupRegistrationRequest;
                $notificationTarget = $groupRequest->submitter;
            }

            $this->notificationService->create(
                $notificationTarget,
                json_encode([
                    'key' => 'notifications.project.registration_approved',
                    'params' => [
                        'project_title' => $registration->project->title
                    ]
                ]),
                'registration_approved',
                'project',
                $registration->project_id
            );

            // If this is part of a group request, return the request with all registrations
            if ($approved->group_registration_request_id) {
                $groupRequest = $approved->groupRegistrationRequest->fresh()->load([
                    'studentGroup.leader',
                    'studentGroup.members',
                    'submitter',
                    'reviewer',
                    'approvedProject',
                    'projectRegistrations.project',
                    'projectRegistrations.student',
                ]);

                return response()->json([
                    'success' => true,
                    'data' => new GroupRegistrationRequestResource($groupRequest),
                    'message' => 'Registration approved successfully. Other projects in this request have been rejected.',
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => new ProjectRegistrationResource($approved->load(['project', 'student', 'reviewer'])),
                'message' => 'Registration approved successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Reject a project registration
     * If the registration belongs to a group request, this will reject the entire request
     */
    public function reject(Request $request, ProjectRegistration $registration): JsonResponse
    {
        $this->authorize('reject', $registration);

        try {
            $settingsService = app(\App\Services\SettingsService::class);
            $committeeReviewCommentsMaxLength = $settingsService->getCommitteeReviewCommentsMaxLength();

            $validated = $request->validate([
                'comments' => "required|string|max:{$committeeReviewCommentsMaxLength}",
            ]);

            // Check if this registration belongs to a group registration request
            if ($registration->group_registration_request_id) {
                $groupRequest = $registration->groupRegistrationRequest;

                // Reject all registrations in the same request
                $allRegistrations = ProjectRegistration::where('group_registration_request_id', $groupRequest->id)
                    ->get();

                foreach ($allRegistrations as $reg) {
                    $reg->update([
                        'status' => 'rejected',
                        'reviewed_by' => $request->user()->id,
                        'reviewed_at' => now(),
                        'review_comments' => $validated['comments'],
                    ]);
                }

                // Update the group request status
                $groupRequest->update([
                    'status' => 'rejected',
                    'reviewed_by' => $request->user()->id,
                    'reviewed_at' => now(),
                    'review_comments' => $validated['comments'],
                ]);

                // Notify group leader about rejection
                $this->notificationService->create(
                    $groupRequest->submitter,
                    json_encode([
                        'key' => 'notifications.project.batch_registration_rejected',
                        'params' => [
                            'comments' => $validated['comments']
                        ]
                    ]),
                    'registration_rejected',
                    'project',
                    null
                );

                return response()->json([
                    'success' => true,
                    'data' => new GroupRegistrationRequestResource($groupRequest->fresh()->load([
                        'studentGroup.leader',
                        'studentGroup.members',
                        'submitter',
                        'reviewer',
                        'projectRegistrations.project',
                    ])),
                    'message' => 'Registration request rejected',
                ]);
            }

            // Legacy: Individual registration rejection
            $rejected = $this->projectService->rejectRegistration(
                $registration,
                $request->user(),
                $validated['comments']
            );

            // Notify student about rejection
            $this->notificationService->create(
                $registration->student,
                json_encode([
                    'key' => 'notifications.project.registration_rejected',
                    'params' => [
                        'project_title' => $registration->project->title,
                        'comments' => $validated['comments']
                    ]
                ]),
                'registration_rejected',
                'project',
                $registration->project_id
            );

            return response()->json([
                'success' => true,
                'data' => new ProjectRegistrationResource($rejected->load(['project', 'student', 'reviewer'])),
                'message' => 'Registration rejected',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    protected function applySearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->whereHas('student', function ($studentQuery) use ($search) {
                $studentQuery->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->orWhereHas('project', function ($projectQuery) use ($search) {
                $projectQuery->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        });
    }

    protected function applyFilters($query, array $filters)
    {
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (isset($filters['project_id'])) {
            $query->where('project_id', $filters['project_id']);
        }
        if (isset($filters['student_id'])) {
            $query->where('student_id', $filters['student_id']);
        }
        return $query;
    }

    /**
     * Get unified group data with proposals and registrations
     * Returns groups with all their proposals and registration requests in one view
     */
    public function unifiedGroups(Request $request): JsonResponse
    {
        $this->authorize('viewAny', GroupRegistrationRequest::class);

        $page = (int) $request->get('page', 1);
        $pageSize = (int) $request->get('pageSize', 10);
        $status = $request->get('status');
        $search = $request->get('search');
        $projectId = $request->get('project_id'); // Filter by specific project

        // Get all active groups that have either proposals, registration requests, or legacy registrations
        $query = StudentGroup::with([
            'leader',
            'members',
            'assignedProjects.supervisor',
        ])
            ->where('status', 'active')
            ->where(function ($q) {
                // Groups with proposals
                $q->whereHas('proposals')
                    // Or groups with registration requests
                    ->orWhereHas('groupRegistrationRequests')
                    // Or groups with legacy project registrations (registrations not linked to GroupRegistrationRequest)
                    // These are registrations where group_registration_request_id is NULL
                    // and the student is either the leader or a member of the group
                    ->orWhere(function ($legacyQuery) {
                        $legacyQuery->whereExists(function ($subQuery) {
                            $subQuery->select(\DB::raw(1))
                                ->from('project_registrations')
                                ->whereNull('group_registration_request_id')
                                ->where(function ($studentQuery) {
                                    // Student is the leader
                                    $studentQuery->whereColumn('project_registrations.student_id', 'student_groups.leader_id')
                                        // Or student is a member of the group
                                        ->orWhereExists(function ($memberQuery) {
                                            $memberQuery->select(\DB::raw(1))
                                                ->from('student_group_members')
                                                ->whereColumn('student_group_members.group_id', 'student_groups.id')
                                                ->whereColumn('student_group_members.student_id', 'project_registrations.student_id');
                                        });
                                });
                        });
                    });
            });

        // Filter by project if specified (show all groups requesting this project)
        if ($projectId) {
            $query->where(function ($q) use ($projectId) {
                // Groups with proposals targeting this project
                $q->whereHas('proposals', function ($proposalQuery) use ($projectId) {
                    $proposalQuery->where('target_project_id', $projectId);
                })
                // Or groups with registration requests for this project
                ->orWhereHas('groupRegistrationRequests.projectRegistrations', function ($regQuery) use ($projectId) {
                    $regQuery->where('project_id', $projectId);
                })
                // Or groups with legacy registrations for this project
                ->orWhere(function ($legacyQuery) use ($projectId) {
                    $legacyQuery->whereExists(function ($subQuery) use ($projectId) {
                        $subQuery->select(\DB::raw(1))
                            ->from('project_registrations')
                            ->whereNull('group_registration_request_id')
                            ->where('project_id', $projectId)
                            ->where(function ($studentQuery) {
                                $studentQuery->whereColumn('project_registrations.student_id', 'student_groups.leader_id')
                                    ->orWhereExists(function ($memberQuery) {
                                        $memberQuery->select(\DB::raw(1))
                                            ->from('student_group_members')
                                            ->whereColumn('student_group_members.group_id', 'student_groups.id')
                                            ->whereColumn('student_group_members.student_id', 'project_registrations.student_id');
                                    });
                            });
                    });
                });
            });
        }

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('group_code', 'like', "%{$search}%")
                    ->orWhereHas('leader', function ($leaderQuery) use ($search) {
                        $leaderQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('proposals', function ($proposalQuery) use ($search) {
                        $proposalQuery->where('title', 'like', "%{$search}%")
                            ->orWhere('description', 'like', "%{$search}%");
                    })
                    ->orWhereHas('groupRegistrationRequests.projectRegistrations.project', function ($projectQuery) use ($search) {
                        $projectQuery->where('title', 'like', "%{$search}%")
                            ->orWhere('description', 'like', "%{$search}%");
                    })
                    // Also search in legacy registrations' projects
                    ->orWhere(function ($legacyQuery) use ($search) {
                        $legacyQuery->whereExists(function ($subQuery) use ($search) {
                            $subQuery->select(\DB::raw(1))
                                ->from('project_registrations')
                                ->join('projects', 'project_registrations.project_id', '=', 'projects.id')
                                ->whereNull('project_registrations.group_registration_request_id')
                                ->where(function ($projectSearch) use ($search) {
                                    $projectSearch->where('projects.title', 'like', "%{$search}%")
                                        ->orWhere('projects.description', 'like', "%{$search}%");
                                })
                                ->where(function ($studentQuery) {
                                    $studentQuery->whereColumn('project_registrations.student_id', 'student_groups.leader_id')
                                        ->orWhereExists(function ($memberQuery) {
                                            $memberQuery->select(\DB::raw(1))
                                                ->from('student_group_members')
                                                ->whereColumn('student_group_members.group_id', 'student_groups.id')
                                                ->whereColumn('student_group_members.student_id', 'project_registrations.student_id');
                                        });
                                });
                        });
                    });
            });
        }

        // Get total count before pagination
        $total = $query->count();

        // Apply pagination
        $groups = $query->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $pageSize)
            ->take($pageSize)
            ->get();

        // Load proposals and registration requests for each group
        $groups->load([
            'proposals' => function ($query) use ($status) {
                $query->with(['submitter', 'reviewer', 'project', 'targetProject', 'proposedSupervisor']);
                if ($status && $status !== 'all') {
                    // Handle both enum and string status values
                    $query->where('status', $status);
                }
                $query->orderBy('created_at', 'desc');
            },
            'groupRegistrationRequests' => function ($query) use ($status) {
                $query->with([
                    'submitter',
                    'reviewer',
                    'approvedProject.supervisor',
                    'projectRegistrations.project.supervisor',
                    'projectRegistrations.student',
                ]);
                if ($status && $status !== 'all') {
                    $query->where('status', $status);
                }
                $query->orderBy('submitted_at', 'desc');
            },
        ]);

        // Transform groups to include proposals and registrations
        $unifiedGroups = $groups->map(function (StudentGroup $group) use ($status) {
            $proposals = $group->proposals ?? collect([]);
            $registrationRequests = $group->groupRegistrationRequests ?? collect([]);

            // Project IDs already present in regular registration requests (avoid showing same project twice)
            $projectIdsInRegularRequests = $registrationRequests
                ->flatMap(fn ($r) => $r->projectRegistrations ?? collect())
                ->pluck('project_id')
                ->unique()
                ->filter()
                ->values()
                ->all();

            // Also fetch legacy registrations (registrations without group_registration_request_id)
            // for group members (leader and members). Exclude projects already in regular requests.
            $memberIds = $group->members()->pluck('users.id')->push($group->leader_id)->unique();

            $legacyRegistrationsQuery = ProjectRegistration::with([
                    'project.supervisor',
                    'student',
                    'reviewer',
                ])
                ->whereNull('group_registration_request_id')
                ->whereIn('student_id', $memberIds);

            if (!empty($projectIdsInRegularRequests)) {
                $legacyRegistrationsQuery->whereNotIn('project_id', $projectIdsInRegularRequests);
            }

            // Apply status filter if provided
            if ($status && $status !== 'all') {
                $legacyRegistrationsQuery->where('status', $status);
            }

            $legacyRegistrations = $legacyRegistrationsQuery->orderBy('submitted_at', 'desc')->get();

            // Convert legacy registrations to GroupRegistrationRequest-like structure
            $legacyRequests = collect([]);
            if ($legacyRegistrations->isNotEmpty()) {
                // Group legacy registrations by submit date (treat all same-day as one request)
                $legacyGrouped = $legacyRegistrations->groupBy(function ($reg) {
                    return $reg->submitted_at ? $reg->submitted_at->format('Y-m-d') : 'unknown';
                });

                foreach ($legacyGrouped as $dateKey => $dateRegistrations) {
                    $firstReg = $dateRegistrations->first();

                    // Create a virtual GroupRegistrationRequest-like object
                    $legacyRequest = new \stdClass();
                    $legacyRequest->id = 'legacy_' . $group->id . '_' . $dateKey;
                    $legacyRequest->student_group_id = $group->id;
                    $legacyRequest->submitted_by = $firstReg->student_id;
                    $legacyRequest->status = $this->determineLegacyRequestStatus($dateRegistrations->all());
                    $legacyRequest->submitted_at = $firstReg->submitted_at ?? now();
                    $legacyRequest->reviewed_at = $firstReg->reviewed_at;
                    $legacyRequest->reviewed_by = $firstReg->reviewed_by;
                    $legacyRequest->review_comments = $firstReg->review_comments;
                    $legacyRequest->approved_project_id = $this->getApprovedProjectId($dateRegistrations->all());
                    $legacyRequest->created_at = $firstReg->created_at ?? now();
                    $legacyRequest->updated_at = $firstReg->updated_at ?? now();

                    // Set relationships
                    $legacyRequest->studentGroup = $group;
                    $legacyRequest->submitter = $firstReg->student;
                    $legacyRequest->reviewer = $firstReg->reviewer;
                    $legacyRequest->approvedProject = $this->getApprovedProject($dateRegistrations->all());
                    $legacyRequest->projectRegistrations = $dateRegistrations;

                    $legacyRequests->push($legacyRequest);
                }
            }

            // Merge regular registration requests with legacy requests
            $allRegistrationRequests = $registrationRequests->concat($legacyRequests);

            // Get approved project (from approved proposal or approved registration)
            $approvedProject = null;
            $approvedProposal = $proposals->first(function ($proposal) {
                return $proposal->status === \App\Enums\ProposalStatus::APPROVED ||
                       (is_string($proposal->status) && $proposal->status === 'approved');
            });
            if ($approvedProposal && $approvedProposal->project) {
                $approvedProject = $approvedProposal->project;
            } else {
                // Check regular registration requests
                $approvedRequest = $registrationRequests->firstWhere('status', 'approved');
                if ($approvedRequest && $approvedRequest->approvedProject) {
                    $approvedProject = $approvedRequest->approvedProject;
                }

                // Also check legacy registrations for approved projects
                if (!$approvedProject) {
                    $approvedLegacy = $legacyRegistrations->firstWhere('status', 'approved');
                    if ($approvedLegacy && $approvedLegacy->project) {
                        $approvedProject = $approvedLegacy->project;
                    }
                }
            }

            // Check if group has any pending proposals or registrations
            $hasPendingProposals = $proposals->contains(function ($proposal) {
                return $proposal->status === \App\Enums\ProposalStatus::PENDING_REVIEW ||
                       (is_string($proposal->status) && $proposal->status === 'pending_review');
            });
            $hasPendingRegistrations = $registrationRequests->contains('status', 'pending') ||
                                       $legacyRegistrations->contains('status', 'pending');

            return [
                'id' => (string) $group->id,
                'group' => new StudentGroupResource($group),
                'proposals' => ProposalResource::collection($proposals),
                'registrationRequests' => GroupRegistrationRequestResource::collection($allRegistrationRequests),
                'approvedProject' => $approvedProject ? new \App\Http\Resources\ProjectResource($approvedProject) : null,
                'hasPendingProposals' => $hasPendingProposals,
                'hasPendingRegistrations' => $hasPendingRegistrations,
                'totalProposals' => $proposals->count(),
                'totalRegistrationRequests' => $allRegistrationRequests->count(),
                'canApproveNewProject' => $approvedProject === null, // Can only approve if no approved project exists
            ];
        });

        $totalPages = (int) ceil($total / $pageSize);

        return response()->json([
            'success' => true,
            'data' => $unifiedGroups,
            'pagination' => [
                'page' => $page,
                'pageSize' => $pageSize,
                'total' => $total,
                'totalPages' => $totalPages,
            ],
        ]);
    }
}
