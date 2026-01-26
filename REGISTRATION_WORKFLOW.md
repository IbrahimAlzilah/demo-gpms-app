# Student Project Registration Workflow - Implementation Guide

## Overview

This document describes the refactored Student Project Registration Workflow that enforces group-based registration with a streamlined approval process.

## Key Features

### 1. **Group-Based Registration Only**
- Students MUST be part of a student group to register for projects
- Only the group leader can submit registration requests
- Group members can view but not modify registration requests

### 2. **Batch Registration System**
- Students can select multiple projects (up to 5) in a single registration request
- All projects are submitted together as one `GroupRegistrationRequest`
- The committee reviews and approves ONE project from the batch
- When one project is approved, all others in the request are automatically rejected

### 3. **Registration Status Tracking**
- Students can view their current registration request status
- Real-time updates on pending, approved, or rejected status
- Clear visibility of all submitted projects and their individual statuses

## Architecture

### Backend Components

#### Models
1. **GroupRegistrationRequest** (`app/Models/GroupRegistrationRequest.php`)
   - Represents a batch registration request from a student group
   - Fields: `student_group_id`, `submitted_by`, `status`, `approved_project_id`, etc.
   - Relationships: `studentGroup`, `submitter`, `reviewer`, `approvedProject`, `projectRegistrations`

2. **ProjectRegistration** (`app/Models/ProjectRegistration.php`)
   - Represents individual project registration within a group request
   - Fields: `project_id`, `student_id`, `group_registration_request_id`, `status`, etc.
   - Relationships: `project`, `student`, `reviewer`, `groupRegistrationRequest`

#### Controllers

1. **Student/ProjectController** (`app/Http/Controllers/Student/ProjectController.php`)
   - `batchRegister()`: Submit batch registration for multiple projects
   - `getGroupRegistrationRequest()`: Get current registration request status
   - `cancelRegistration()`: Cancel pending registration request
   - `getRegistrations()`: Get all registrations for the student

2. **ProjectsCommittee/RegistrationController** (`app/Http/Controllers/ProjectsCommittee/RegistrationController.php`)
   - `index()`: List all registration requests (grouped and individual views)
   - `getGroupedRequests()`: Get grouped registration requests with pagination
   - `approve()`: Approve a project (auto-rejects others in the same request)
   - `reject()`: Reject entire registration request

#### Services

**ProjectService** (`app/Services/ProjectService.php`)
- `registerGroupBatch()`: Handle batch registration logic
- `approveRegistration()`: Approve registration and assign project to group
- `rejectRegistration()`: Reject registration with comments
- `validateGroupNotRegistered()`: Ensure group doesn't have existing registrations

### Frontend Components

#### Pages

1. **RegistrationStatusPage** (`frontend/src/pages/student/projects/status/RegistrationStatusPage.tsx`)
   - Displays current registration request status
   - Shows all submitted projects with their individual statuses
   - Displays group information and member details
   - Allows cancellation of pending requests
   - Provides navigation to follow-up or browse projects based on status

2. **BatchRegistrationForm** (`frontend/src/pages/student/projects/components/BatchRegistrationForm/`)
   - Multi-project selection interface
   - Group validation and leader check
   - Period validation (registration window)
   - Submit batch registration request

3. **GroupedRegistrationCard** (`frontend/src/pages/committee/projects/registrations/components/GroupedRegistrationCard/`)
   - Committee view of group registration requests
   - Expandable card showing all projects in request
   - Approve individual project or reject entire request
   - Group details and member information

#### Hooks

1. **useGroupRegistrationRequest** (`frontend/src/pages/student/projects/hooks/useGroupRegistrationRequest.ts`)
   - Fetches current registration request status
   - Auto-refreshes on mutations

2. **useBatchRegisterProjects** (existing in `useProjectOperations.ts`)
   - Handles batch registration submission
   - Validates group and period requirements

## Workflow Steps

### Student Side

1. **Form a Group**
   - Students create or join a student group
   - Group must have 2-5 members (configurable)
   - One member is designated as the group leader

2. **Browse Available Projects**
   - View projects with status "Available for Registration"
   - Filter and search projects
   - View project details, supervisor, and requirements

3. **Submit Batch Registration**
   - Group leader selects multiple projects (1-5)
   - System validates:
     - User is group leader
     - Group meets size requirements
     - Registration period is active
     - Group has no existing approved registrations
   - Submit as single `GroupRegistrationRequest`

4. **Track Registration Status**
   - Navigate to Registration Status page
   - View current request status (pending/approved/rejected)
   - See all submitted projects and their statuses
   - Cancel pending request if needed

5. **Receive Decision**
   - Get notification when committee makes decision
   - If approved: Navigate to project follow-up
   - If rejected: Can submit new registration request

### Committee Side

1. **View Registration Requests**
   - Toggle between grouped and individual views
   - Filter by status (pending/approved/rejected)
   - Search by group name, student, or project

2. **Review Group Request**
   - Expand request to see all submitted projects
   - View group details and members
   - Review each project's details

3. **Make Decision**
   - **Approve**: Select ONE project from the batch
     - Approving one project automatically rejects all others
     - Project is assigned to the group
     - All group members are added to the project
     - Group leader receives notification
   - **Reject**: Reject entire registration request
     - All projects in the request are rejected
     - Provide rejection comments
     - Group leader receives notification with comments

## API Endpoints

### Student Endpoints

```
GET    /api/student/projects/registration-request
       Get current group registration request status

POST   /api/student/projects/batch-register
       Submit batch registration for multiple projects
       Body: { project_ids: string[], student_group_id: string }

GET    /api/student/projects/registrations
       Get all project registrations for the student

DELETE /api/student/projects/registrations/{registration}
       Cancel a pending registration request
```

### Committee Endpoints

```
GET    /api/projects-committee/registrations?grouped=true
       Get grouped registration requests with pagination

POST   /api/projects-committee/registrations/{registration}/approve
       Approve a project registration (rejects others in same request)
       Body: { comments?: string }

POST   /api/projects-committee/registrations/{registration}/reject
       Reject entire registration request
       Body: { comments: string }
```

## Database Schema

### group_registration_requests
```sql
- id
- student_group_id (FK to student_groups)
- submitted_by (FK to users)
- status (pending|approved|rejected|cancelled)
- submitted_at
- reviewed_at
- reviewed_by (FK to users)
- review_comments
- approved_project_id (FK to projects)
- created_at
- updated_at
```

### project_registrations
```sql
- id
- project_id (FK to projects)
- student_id (FK to users)
- group_registration_request_id (FK to group_registration_requests, nullable)
- status (pending|approved|rejected|cancelled)
- submitted_at
- reviewed_at
- reviewed_by (FK to users)
- review_comments
- created_at
- updated_at
```

## Validation Rules

### Group Requirements
- Minimum members: 2 (configurable via SettingsService)
- Maximum members: 5 (configurable via SettingsService)
- Group must have status: 'active'
- Only group leader can submit registrations

### Registration Requirements
- Registration period must be active
- Group must not have existing approved registrations
- Group must not be assigned to any project
- Projects must be in "Available for Registration" status
- Projects must not be assigned to other groups
- Maximum 5 projects per batch registration

### Approval Rules
- Only one project can be approved per group registration request
- Approving one project automatically rejects all others in the request
- All group members are added to the approved project
- Project status changes to "In Progress"
- Project is marked as assigned to the group

## Notifications

### Student Notifications
- **Registration Submitted**: Confirmation when batch registration is submitted
- **Registration Approved**: When committee approves a project
- **Registration Rejected**: When committee rejects the request (with comments)

### Committee Notifications
- **New Registration Request**: When a group submits a new registration request

## Error Handling

### Common Errors
1. **Not Group Leader**: Only group leader can register
2. **Group Size Invalid**: Group doesn't meet min/max requirements
3. **Already Registered**: Group has existing approved registration
4. **Period Closed**: Registration period is not active
5. **Project Unavailable**: Project is not available for registration
6. **Project Assigned**: Project is already assigned to another group

## Testing Checklist

### Student Flow
- [ ] Can only register as group leader
- [ ] Can select 1-5 projects
- [ ] Cannot register outside registration period
- [ ] Cannot register if group already has approved project
- [ ] Can view registration status
- [ ] Can cancel pending registration
- [ ] Receives notifications on approval/rejection

### Committee Flow
- [ ] Can view grouped registration requests
- [ ] Can expand request to see all projects
- [ ] Can approve one project (others auto-reject)
- [ ] Can reject entire request with comments
- [ ] Can filter and search requests
- [ ] Can toggle between grouped and individual views

### Edge Cases
- [ ] Group leader changes during pending registration
- [ ] Project becomes unavailable after registration
- [ ] Multiple groups register for same project
- [ ] Registration period closes during submission
- [ ] Group size changes during pending registration

## Future Enhancements

1. **Priority Ranking**: Allow students to rank their project preferences
2. **Auto-Assignment**: Automatic assignment based on preferences and availability
3. **Waitlist**: Queue system for popular projects
4. **Re-registration**: Allow re-registration after rejection with cooldown period
5. **Analytics**: Dashboard showing registration statistics and trends

## Migration Notes

### From Individual to Group Registration
- Existing individual registrations are preserved
- Legacy registrations (without group_registration_request_id) are displayed separately
- System supports both old and new registration formats
- Gradual migration path for existing data

## Support and Troubleshooting

### Common Issues

**Issue**: "Only group leaders can register"
**Solution**: Verify user is the group leader in student_groups table

**Issue**: "Group already has approved registration"
**Solution**: Check project_registrations for approved status

**Issue**: "Registration period closed"
**Solution**: Verify time_windows table for active project_registration period

**Issue**: "Project not available"
**Solution**: Check project status is "available_for_registration"

## Conclusion

This refactored workflow provides a streamlined, group-based registration system that:
- Enforces proper group formation
- Simplifies the approval process
- Provides clear status tracking
- Reduces administrative overhead
- Improves student and committee experience

For questions or issues, please refer to the codebase documentation or contact the development team.
