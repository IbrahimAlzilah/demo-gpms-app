# Proposal Workflow Refactoring Prompt

## Overview
Refactor the Proposal Workflow system to implement a new submission model where group leaders can submit multiple proposals in a single request, with enhanced access control and committee management features.

## Current System Analysis

### Backend Structure
- **Models**: `Proposal` (belongs to User submitter, StudentGroup, Project)
- **Controllers**: 
  - `Student\ProposalController` - handles student proposal submissions
  - `Supervisor\ProposalController` - handles supervisor proposal submissions
  - `ProjectsCommittee\ProposalController` - handles committee review actions
- **Services**: `ProposalService` - business logic for proposal operations
- **Policies**: `ProposalPolicy` - authorization rules
- **Routes**: 
  - Student: `GET/POST/PUT/DELETE /api/student/proposals`
  - Supervisor: `GET/POST/PUT/DELETE /api/supervisor/proposals`
  - Committee: `GET/POST/PUT/DELETE /api/projects-committee/proposals` + approve/reject/requestModification endpoints

### Frontend Structure
- **Student Pages**: `frontend/src/pages/student/proposals/`
  - List, View, New, Edit pages
  - ProposalForm component
- **Supervisor Pages**: `frontend/src/pages/supervisor/proposals/`
  - Similar structure to student pages
- **Committee Pages**: `frontend/src/pages/committee/projects/proposals/`
  - List with actions (approve, reject, request modification, edit, delete)
  - View page for details

### Current Database Schema
- `proposals` table:
  - `id`, `title`, `description`
  - `submitter_id` (FK to users)
  - `student_group_id` (FK to student_groups, nullable)
  - `proposed_supervisor_id` (FK to users, nullable)
  - `target_project_id` (FK to projects, nullable)
  - `team_members` (JSON array)
  - `status` (enum: pending_review, approved, rejected, requires_modification)
  - `review_notes`, `reviewed_by`, `reviewed_at`
  - `project_id` (FK to projects, nullable - created project if approved)

## Required Changes

### 1. Database Schema Changes

#### Option A: Add Proposal Submission Request Model (Recommended)
Create a new `proposal_submissions` table to group multiple proposals in a single submission:

```php
// Migration: create_proposal_submissions_table
Schema::create('proposal_submissions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('submitter_id')->constrained('users')->onDelete('cascade');
    $table->foreignId('student_group_id')->nullable()->constrained('student_groups')->onDelete('cascade');
    $table->enum('status', ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'requires_modification'])->default('draft');
    $table->text('review_notes')->nullable();
    $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
    $table->timestamp('reviewed_at')->nullable();
    $table->timestamp('submitted_at')->nullable();
    $table->timestamps();
    
    $table->index(['submitter_id', 'status']);
    $table->index(['student_group_id', 'status']);
});

// Add foreign key to proposals table
Schema::table('proposals', function (Blueprint $table) {
    $table->foreignId('submission_id')->nullable()->after('id')->constrained('proposal_submissions')->onDelete('cascade');
    $table->index('submission_id');
});
```

#### Option B: Use Existing Proposals Table with Submission Grouping
Add a `submission_id` field to group proposals together, and track submission status at the proposal level.

### 2. Backend Changes

#### 2.1 New Model: ProposalSubmission (if using Option A)
```php
// app/Models/ProposalSubmission.php
class ProposalSubmission extends Model
{
    protected $fillable = [
        'submitter_id',
        'student_group_id',
        'status',
        'review_notes',
        'reviewed_by',
        'reviewed_at',
        'submitted_at',
    ];
    
    protected $casts = [
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'status' => ProposalSubmissionStatus::class,
    ];
    
    // Relationships
    public function submitter(): BelongsTo
    public function studentGroup(): BelongsTo
    public function reviewer(): BelongsTo
    public function proposals(): HasMany
}
```

#### 2.2 Update Proposal Model
- Add `submission_id` relationship (if using Option A)
- Add method to check if submitter has already submitted: `hasSubmitted()`

#### 2.3 Update Student\ProposalController

**New Requirements:**
1. **Only group leader can submit**: Check if user is group leader before allowing submission
2. **One submission per student/supervisor**: Enforce that each user can only have one active submission
3. **Multiple proposals per submission**: Allow submitting multiple proposals in a single request
4. **Prevent new submissions after first submission**: Once submitted, only allow editing existing proposals

**New/Updated Methods:**

```php
// New: Submit multiple proposals in one request
public function submitProposals(Request $request): JsonResponse
{
    $user = $request->user();
    
    // 1. Verify user is a group leader
    $studentGroup = StudentGroup::where('leader_id', $user->id)
        ->where('status', 'active')
        ->first();
    
    if (!$studentGroup) {
        return response()->json([
            'success' => false,
            'message' => 'Only group leaders can submit proposals',
        ], 403);
    }
    
    // 2. Check if user has already submitted (one submission per user)
    $existingSubmission = ProposalSubmission::where('submitter_id', $user->id)
        ->whereIn('status', ['submitted', 'under_review', 'requires_modification'])
        ->first();
    
    if ($existingSubmission) {
        return response()->json([
            'success' => false,
            'message' => 'You have already submitted a proposal. You can only edit your existing submission.',
        ], 422);
    }
    
    // 3. Validate proposals array
    $validated = $request->validate([
        'proposals' => 'required|array|min:1',
        'proposals.*.title' => 'required|string|max:255',
        'proposals.*.description' => 'required|string',
        'proposals.*.proposed_supervisor_id' => 'nullable|exists:users,id',
        'proposals.*.target_project_id' => 'nullable|exists:projects,id',
    ]);
    
    // 4. Create submission with multiple proposals
    $submission = DB::transaction(function () use ($validated, $user, $studentGroup) {
        $submission = ProposalSubmission::create([
            'submitter_id' => $user->id,
            'student_group_id' => $studentGroup->id,
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);
        
        foreach ($validated['proposals'] as $proposalData) {
            Proposal::create([
                'submission_id' => $submission->id,
                'title' => $proposalData['title'],
                'description' => $proposalData['description'],
                'submitter_id' => $user->id,
                'student_group_id' => $studentGroup->id,
                'proposed_supervisor_id' => $proposalData['proposed_supervisor_id'] ?? null,
                'target_project_id' => $proposalData['target_project_id'] ?? null,
                'status' => 'pending_review',
            ]);
        }
        
        return $submission;
    });
    
    return response()->json([
        'success' => true,
        'data' => new ProposalSubmissionResource($submission->load('proposals')),
        'message' => 'Proposals submitted successfully',
    ], 201);
}

// Updated: Only allow viewing if user is group leader
public function index(Request $request): JsonResponse
{
    $user = $request->user();
    
    // Only group leaders can see proposals
    $studentGroup = StudentGroup::where('leader_id', $user->id)
        ->where('status', 'active')
        ->first();
    
    if (!$studentGroup) {
        return response()->json([
            'success' => false,
            'data' => [],
            'message' => 'Only group leaders can view proposals',
        ]);
    }
    
    // Get submission for this group leader
    $submission = ProposalSubmission::where('submitter_id', $user->id)
        ->with('proposals')
        ->first();
    
    return response()->json([
        'success' => true,
        'data' => $submission ? new ProposalSubmissionResource($submission) : null,
    ]);
}

// Updated: Allow editing proposals within existing submission
public function updateProposals(Request $request, ProposalSubmission $submission): JsonResponse
{
    $user = $request->user();
    
    // Verify ownership
    if ($submission->submitter_id !== $user->id) {
        abort(403, 'Unauthorized');
    }
    
    // Prevent editing if already approved/rejected
    if (in_array($submission->status, ['approved', 'rejected'])) {
        return response()->json([
            'success' => false,
            'message' => 'Cannot edit approved or rejected submissions',
        ], 422);
    }
    
    // Allow editing proposals or adding new ones only if status allows
    // Implementation details...
}
```

#### 2.4 Update Supervisor\ProposalController

Similar changes as Student controller:
- Only allow one submission per supervisor
- Prevent new submissions after first submission
- Allow editing existing proposals

#### 2.5 Update ProjectsCommittee\ProposalController

**New Requirements:**
1. Display each submission as a single request (not individual proposals)
2. Detailed view page showing all proposals in a submission
3. Actions: Approve, Reject, Edit, Delete, Request Modifications

**New/Updated Methods:**

```php
// Updated: List submissions instead of individual proposals
public function index(Request $request): JsonResponse
{
    $query = ProposalSubmission::with(['submitter', 'studentGroup', 'proposals', 'reviewer']);
    
    if ($request->has('status')) {
        $query->where('status', $request->status);
    }
    
    $query = $this->applyTableQuery($query, $request);
    
    return response()->json(
        $this->getPaginatedResponse($query, $request, ProposalSubmissionResource::class)
    );
}

// New: Detailed view of a submission
public function show(ProposalSubmission $submission): JsonResponse
{
    $submission->load([
        'submitter',
        'studentGroup.members',
        'studentGroup.leader',
        'proposals.proposedSupervisor',
        'proposals.targetProject',
        'reviewer'
    ]);
    
    return response()->json([
        'success' => true,
        'data' => new ProposalSubmissionResource($submission),
    ]);
}

// Updated: Approve entire submission
public function approve(Request $request, ProposalSubmission $submission): JsonResponse
{
    $validated = $request->validate([
        'approved_proposal_ids' => 'required|array',
        'approved_proposal_ids.*' => 'exists:proposals,id',
        'project_ids' => 'nullable|array',
        'project_ids.*' => 'exists:projects,id',
    ]);
    
    // Approve selected proposals and create projects
    // Implementation...
}

// Updated: Reject entire submission
public function reject(Request $request, ProposalSubmission $submission): JsonResponse
{
    $validated = $request->validate([
        'review_notes' => 'required|string',
    ]);
    
    $submission->update([
        'status' => 'rejected',
        'review_notes' => $validated['review_notes'],
        'reviewed_by' => $request->user()->id,
        'reviewed_at' => now(),
    ]);
    
    // Reject all proposals in submission
    $submission->proposals()->update(['status' => 'rejected']);
    
    return response()->json([
        'success' => true,
        'data' => new ProposalSubmissionResource($submission->fresh()),
        'message' => 'Submission rejected',
    ]);
}

// Updated: Request modifications
public function requestModification(Request $request, ProposalSubmission $submission): JsonResponse
{
    $validated = $request->validate([
        'review_notes' => 'required|string',
        'proposal_ids' => 'nullable|array', // Optional: specify which proposals need modification
    ]);
    
    $submission->update([
        'status' => 'requires_modification',
        'review_notes' => $validated['review_notes'],
        'reviewed_by' => $request->user()->id,
        'reviewed_at' => now(),
    ]);
    
    // Update proposal statuses
    if (isset($validated['proposal_ids'])) {
        $submission->proposals()
            ->whereIn('id', $validated['proposal_ids'])
            ->update(['status' => 'requires_modification']);
    } else {
        $submission->proposals()->update(['status' => 'requires_modification']);
    }
    
    return response()->json([
        'success' => true,
        'data' => new ProposalSubmissionResource($submission->fresh()),
        'message' => 'Modification requested',
    ]);
}

// Updated: Edit submission (edit proposals within)
public function update(Request $request, ProposalSubmission $submission): JsonResponse
{
    // Allow committee to edit proposals within a submission
    // Implementation...
}

// Updated: Delete entire submission
public function destroy(ProposalSubmission $submission): JsonResponse
{
    // Delete submission and all associated proposals
    // Implementation...
}
```

#### 2.6 Update ProposalService

Add methods for:
- Creating submission with multiple proposals
- Checking if user has submitted
- Bulk approval/rejection of proposals in a submission

#### 2.7 Update ProposalPolicy

Add authorization checks:
- Only group leaders can view/create proposals
- Only group leaders can see their group's submissions
- Committee can view all submissions

### 3. Frontend Changes

#### 3.1 Student Proposal Pages

**New Route Structure:**
- `/student/proposals` - View existing submission (if group leader) or message (if not leader)
- `/student/proposals/submit` - Submit new proposals (only for group leaders, only if not submitted)
- `/student/proposals/edit` - Edit existing submission (only if status allows)

**New Components:**

1. **ProposalSubmissionForm** (`frontend/src/pages/student/proposals/submit/ProposalSubmissionForm.tsx`)
   - Form to add multiple proposals
   - Dynamic proposal fields (add/remove proposals)
   - Submit all proposals in one request
   - Only visible to group leaders
   - Only available if no existing submission

2. **ProposalSubmissionView** (`frontend/src/pages/student/proposals/view/ProposalSubmissionView.tsx`)
   - Display all proposals in the submission
   - Show submission status
   - Allow editing if status permits
   - Show review notes if available

3. **Update ProposalsList** (`frontend/src/pages/student/proposals/list/ProposalsList.screen.tsx`)
   - Check if user is group leader
   - If not leader: Show message "Only group leaders can view and submit proposals"
   - If leader: Show submission status and link to view/edit

#### 3.2 Supervisor Proposal Pages

Similar changes as student pages:
- Only one submission per supervisor
- Prevent new submissions after first
- Allow editing existing proposals

#### 3.3 Committee Proposal Pages

**New Route Structure:**
- `/committee/projects/proposals` - List of submissions (not individual proposals)
- `/committee/projects/proposals/:submissionId` - Detailed view of a submission

**New Components:**

1. **SubmissionsList** (`frontend/src/pages/committee/projects/proposals/list/SubmissionsList.screen.tsx`)
   - Table showing submissions (not individual proposals)
   - Columns: Submitter, Group, Number of Proposals, Status, Submitted At, Actions
   - Actions: View, Approve, Reject, Request Modifications, Edit, Delete

2. **SubmissionDetailsView** (`frontend/src/pages/committee/projects/proposals/view/SubmissionDetailsView.screen.tsx`)
   - Display all proposals in the submission
   - Show submitter and group information
   - Show each proposal with details
   - Action buttons: Approve, Reject, Request Modifications, Edit, Delete
   - For approval: Allow selecting which proposals to approve
   - For rejection/modification: Text area for review notes

3. **Update API Services** (`frontend/src/pages/committee/projects/proposals/api/`)
   - Update to use submission endpoints instead of proposal endpoints
   - New hooks: `useSubmissionsList`, `useApproveSubmission`, `useRejectSubmission`, etc.

### 4. API Routes Updates

```php
// Student routes
Route::prefix('student')->middleware('role:student')->group(function () {
    // Get submission (only for group leaders)
    Route::get('proposal-submission', [ProposalController::class, 'getSubmission']);
    
    // Submit proposals (only for group leaders, only if not submitted)
    Route::post('proposal-submission', [ProposalController::class, 'submitProposals'])
        ->middleware('window:proposal_submission,project_registration');
    
    // Update submission (edit proposals)
    Route::put('proposal-submission/{submission}', [ProposalController::class, 'updateSubmission'])
        ->middleware('window:proposal_submission,project_registration');
    
    // View submission
    Route::get('proposal-submission/{submission}', [ProposalController::class, 'showSubmission']);
});

// Supervisor routes (similar structure)
Route::prefix('supervisor')->middleware('role:supervisor')->group(function () {
    Route::get('proposal-submission', [ProposalController::class, 'getSubmission']);
    Route::post('proposal-submission', [ProposalController::class, 'submitProposals'])
        ->middleware('window:proposal_submission');
    Route::put('proposal-submission/{submission}', [ProposalController::class, 'updateSubmission'])
        ->middleware('window:proposal_submission');
    Route::get('proposal-submission/{submission}', [ProposalController::class, 'showSubmission']);
});

// Committee routes
Route::prefix('projects-committee')->middleware('role:projects_committee')->group(function () {
    // List submissions
    Route::get('proposal-submissions', [ProposalController::class, 'index']);
    
    // View submission details
    Route::get('proposal-submissions/{submission}', [ProposalController::class, 'show']);
    
    // Actions
    Route::post('proposal-submissions/{submission}/approve', [ProposalController::class, 'approve']);
    Route::post('proposal-submissions/{submission}/reject', [ProposalController::class, 'reject']);
    Route::post('proposal-submissions/{submission}/request-modification', [ProposalController::class, 'requestModification']);
    
    // Edit and delete
    Route::put('proposal-submissions/{submission}', [ProposalController::class, 'update']);
    Route::delete('proposal-submissions/{submission}', [ProposalController::class, 'destroy']);
});
```

### 5. Validation Rules

#### Backend Validation
- Group leader check: User must be leader of an active group
- One submission per user: Check for existing submission with status in ['submitted', 'under_review', 'requires_modification']
- Minimum proposals: At least 1 proposal per submission
- Maximum proposals: Consider adding a limit (e.g., 5 proposals per submission)
- Proposal fields: Title, description required; supervisor and target project optional

#### Frontend Validation
- Show/hide submit form based on user role (group leader) and submission status
- Disable submit button if user already submitted
- Validate proposal form fields before submission
- Show appropriate error messages

### 6. Migration Strategy

1. **Create new tables/migrations** for `proposal_submissions`
2. **Add `submission_id` to `proposals` table**
3. **Migrate existing data**: 
   - Create a submission for each existing proposal
   - Link proposals to their submission
4. **Update all controllers, services, policies**
5. **Update frontend components and routes**
6. **Test thoroughly** before deploying

### 7. Testing Requirements

1. **Student/Group Leader Tests:**
   - Group leader can submit multiple proposals
   - Non-leader group members cannot see/submit proposals
   - Group leader cannot submit again after first submission
   - Group leader can edit existing submission
   - Group leader cannot add new proposals after submission

2. **Supervisor Tests:**
   - Supervisor can submit once
   - Supervisor cannot submit again after first submission
   - Supervisor can edit existing submission

3. **Committee Tests:**
   - Committee can view all submissions
   - Committee can view submission details
   - Committee can approve/reject entire submission
   - Committee can request modifications
   - Committee can edit proposals within submission
   - Committee can delete submission

4. **Edge Cases:**
   - Group leader leaves group
   - Group is deleted
   - Multiple proposals in submission with different statuses
   - Partial approval of proposals in a submission

## Implementation Checklist

### Backend
- [ ] Create `proposal_submissions` migration
- [ ] Create `ProposalSubmission` model
- [ ] Create `ProposalSubmissionStatus` enum
- [ ] Update `Proposal` model (add `submission_id`)
- [ ] Update `Student\ProposalController` (new submission methods)
- [ ] Update `Supervisor\ProposalController` (new submission methods)
- [ ] Update `ProjectsCommittee\ProposalController` (work with submissions)
- [ ] Update `ProposalService` (submission logic)
- [ ] Update `ProposalPolicy` (authorization rules)
- [ ] Create `ProposalSubmissionResource` (API resource)
- [ ] Update API routes
- [ ] Create data migration script for existing proposals

### Frontend
- [ ] Create `ProposalSubmissionForm` component
- [ ] Create `ProposalSubmissionView` component
- [ ] Update student proposals list page
- [ ] Update student proposals routes
- [ ] Create committee submissions list page
- [ ] Create committee submission details view
- [ ] Update committee proposals routes
- [ ] Update API services and hooks
- [ ] Update translations/i18n

### Testing
- [ ] Unit tests for models and services
- [ ] Feature tests for controllers
- [ ] Frontend component tests
- [ ] Integration tests for full workflow
- [ ] Manual testing for all user roles

## Notes

- Consider backward compatibility if there are existing proposals in the system
- Ensure proper error handling and user feedback
- Add appropriate logging for submission actions
- Consider adding email notifications for submission status changes
- Review and update any related documentation
