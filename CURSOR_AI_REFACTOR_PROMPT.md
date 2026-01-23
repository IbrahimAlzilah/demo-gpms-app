# Cursor AI: Refactor Proposal Workflow

## Task Overview
Refactor the Proposal Workflow system to allow group leaders to submit multiple proposals in a single request, with strict access control and enhanced committee management.

## Key Requirements

### 1. Group Leader Submission
- **Only group leaders can submit proposals** - Other group members cannot see or access proposal submission features
- **Multiple proposals per submission** - Group leader can submit one or more proposals in a single request
- **One submission per user** - Each student and supervisor can submit only once
- **Edit existing, prevent new** - After submission, allow editing of submitted proposals but prevent adding new ones

### 2. Access Control
- **Students**: Only group leaders can view/submit proposals. Non-leader members see a message: "Only group leaders can view and submit proposals"
- **Supervisors**: Can submit once, then only edit existing proposals
- **Projects Committee**: Full access to view and manage all submissions

### 3. Committee Management
- **Display as submissions, not individual proposals** - Each submission appears as a single request in the committee list
- **Detailed view page** - Committee can view all proposals within a submission on a dedicated page
- **Actions available**: Approve, Reject, Edit, Delete, Request Modifications

## Implementation Steps

### Step 1: Database Schema
Create a new `proposal_submissions` table to group multiple proposals:

```sql
CREATE TABLE proposal_submissions (
    id BIGINT PRIMARY KEY,
    submitter_id BIGINT NOT NULL,
    student_group_id BIGINT NULLABLE,
    status ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected', 'requires_modification'),
    review_notes TEXT NULLABLE,
    reviewed_by BIGINT NULLABLE,
    reviewed_at TIMESTAMP NULLABLE,
    submitted_at TIMESTAMP NULLABLE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (submitter_id) REFERENCES users(id),
    FOREIGN KEY (student_group_id) REFERENCES student_groups(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

ALTER TABLE proposals ADD COLUMN submission_id BIGINT NULLABLE;
ALTER TABLE proposals ADD FOREIGN KEY (submission_id) REFERENCES proposal_submissions(id);
```

### Step 2: Backend Models
1. Create `ProposalSubmission` model with relationships to User (submitter, reviewer), StudentGroup, and Proposals
2. Create `ProposalSubmissionStatus` enum (draft, submitted, under_review, approved, rejected, requires_modification)
3. Update `Proposal` model to include `submission_id` relationship

### Step 3: Backend Controllers

#### Student\ProposalController
- **New method `submitProposals()`**: 
  - Verify user is group leader
  - Check if user already has a submission (prevent multiple submissions)
  - Accept array of proposals, create submission with all proposals
  - Return submission resource
  
- **Update `index()`**: 
  - Check if user is group leader
  - Return existing submission if exists, null if not
  - Non-leaders get empty result with appropriate message
  
- **New method `updateSubmission()`**: 
  - Allow editing proposals within existing submission
  - Prevent adding new proposals after submission
  - Only allow if status is 'submitted', 'under_review', or 'requires_modification'

#### Supervisor\ProposalController
- Similar changes as Student controller
- No group leader check (supervisors submit individually)

#### ProjectsCommittee\ProposalController
- **Update `index()`**: Query `ProposalSubmission` instead of `Proposal`, return submissions list
- **New method `show()`**: Display submission with all proposals, submitter info, group info
- **Update `approve()`**: Accept submission ID, approve selected proposals (or all)
- **Update `reject()`**: Reject entire submission with review notes
- **Update `requestModification()`**: Request modifications for submission with notes
- **Update `update()`**: Edit proposals within submission
- **Update `destroy()`**: Delete submission and all associated proposals

### Step 4: Backend Services
Update `ProposalService`:
- Add `createSubmission(array $proposals, User $submitter, ?StudentGroup $group)`
- Add `hasSubmitted(User $user)`: Check if user already has a submission
- Update approval/rejection methods to work with submissions

### Step 5: Backend Policies
Update `ProposalPolicy`:
- `view()`: Only group leaders can view their submission
- `create()`: Only group leaders can create submissions
- `update()`: Only group leaders can update their submission (if status allows)
- Committee has full access

### Step 6: Backend Routes
```php
// Student routes
Route::get('proposal-submission', [ProposalController::class, 'getSubmission']);
Route::post('proposal-submission', [ProposalController::class, 'submitProposals']);
Route::put('proposal-submission/{submission}', [ProposalController::class, 'updateSubmission']);
Route::get('proposal-submission/{submission}', [ProposalController::class, 'showSubmission']);

// Supervisor routes (similar)
Route::get('proposal-submission', [ProposalController::class, 'getSubmission']);
Route::post('proposal-submission', [ProposalController::class, 'submitProposals']);
Route::put('proposal-submission/{submission}', [ProposalController::class, 'updateSubmission']);

// Committee routes
Route::get('proposal-submissions', [ProposalController::class, 'index']);
Route::get('proposal-submissions/{submission}', [ProposalController::class, 'show']);
Route::post('proposal-submissions/{submission}/approve', [ProposalController::class, 'approve']);
Route::post('proposal-submissions/{submission}/reject', [ProposalController::class, 'reject']);
Route::post('proposal-submissions/{submission}/request-modification', [ProposalController::class, 'requestModification']);
Route::put('proposal-submissions/{submission}', [ProposalController::class, 'update']);
Route::delete('proposal-submissions/{submission}', [ProposalController::class, 'destroy']);
```

### Step 7: Frontend - Student Pages
1. **Update ProposalsList page**:
   - Check if user is group leader
   - If not leader: Show message "Only group leaders can view and submit proposals"
   - If leader: Show submission status, link to view/edit

2. **Create ProposalSubmissionForm component**:
   - Dynamic form to add/remove multiple proposals
   - Each proposal has: title, description, proposed supervisor (optional), target project (optional)
   - Submit all proposals in one request
   - Only visible if user is group leader and hasn't submitted yet

3. **Create ProposalSubmissionView component**:
   - Display all proposals in submission
   - Show submission status and review notes
   - Edit button (if status allows)
   - Only visible to group leaders

4. **Update routes**:
   - `/student/proposals` - List/view submission
   - `/student/proposals/submit` - Submit new (only if not submitted)
   - `/student/proposals/edit` - Edit existing

### Step 8: Frontend - Committee Pages
1. **Update ProposalsList to SubmissionsList**:
   - Table columns: Submitter Name, Group Name, Number of Proposals, Status, Submitted At, Actions
   - Actions dropdown: View, Approve, Reject, Request Modifications, Edit, Delete

2. **Create SubmissionDetailsView page**:
   - Display submission header (submitter, group, status, dates)
   - List all proposals in submission with details
   - Action buttons: Approve, Reject, Request Modifications, Edit, Delete
   - For approval: Checkboxes to select which proposals to approve
   - For rejection/modification: Textarea for review notes

3. **Update API services**:
   - Change from proposal endpoints to submission endpoints
   - Update hooks: `useSubmissionsList`, `useApproveSubmission`, `useRejectSubmission`, etc.

### Step 9: Data Migration
Create migration script to:
- Create a submission for each existing proposal
- Link proposals to their submission
- Set appropriate statuses

## Validation Rules

### Backend
- User must be group leader (for students)
- User cannot have existing submission with status in ['submitted', 'under_review', 'requires_modification']
- At least 1 proposal required per submission
- Maximum 5 proposals per submission (configurable)
- Proposal title and description required

### Frontend
- Show/hide submit button based on role and submission status
- Disable submit if already submitted
- Validate all proposal fields before submission
- Show clear error messages

## Testing Checklist
- [ ] Group leader can submit multiple proposals
- [ ] Non-leader group members cannot see/submit
- [ ] Group leader cannot submit twice
- [ ] Group leader can edit existing submission
- [ ] Group leader cannot add new proposals after submission
- [ ] Supervisor can submit once
- [ ] Committee can view all submissions
- [ ] Committee can approve/reject submissions
- [ ] Committee can request modifications
- [ ] Committee can edit and delete submissions

## Files to Modify

### Backend
- `database/migrations/XXXX_create_proposal_submissions_table.php` (new)
- `database/migrations/XXXX_add_submission_id_to_proposals.php` (new)
- `app/Models/ProposalSubmission.php` (new)
- `app/Enums/ProposalSubmissionStatus.php` (new)
- `app/Models/Proposal.php` (update)
- `app/Http/Controllers/Student/ProposalController.php` (update)
- `app/Http/Controllers/Supervisor/ProposalController.php` (update)
- `app/Http/Controllers/ProjectsCommittee/ProposalController.php` (update)
- `app/Services/ProposalService.php` (update)
- `app/Policies/ProposalPolicy.php` (update)
- `app/Http/Resources/ProposalSubmissionResource.php` (new)
- `routes/api.php` (update)

### Frontend
- `src/pages/student/proposals/submit/ProposalSubmissionForm.tsx` (new)
- `src/pages/student/proposals/view/ProposalSubmissionView.tsx` (new)
- `src/pages/student/proposals/list/ProposalsList.screen.tsx` (update)
- `src/pages/committee/projects/proposals/list/SubmissionsList.screen.tsx` (new/update)
- `src/pages/committee/projects/proposals/view/SubmissionDetailsView.screen.tsx` (new)
- `src/pages/committee/projects/proposals/api/submission.service.ts` (new/update)
- `src/routes/config.tsx` (update)

## Important Notes
- Maintain backward compatibility with existing proposals
- Ensure proper error handling and user feedback
- Add appropriate logging
- Update translations/i18n files
- Test all user roles and edge cases
