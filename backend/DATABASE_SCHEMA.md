# GPMS Database Schema Documentation

This document describes the complete database schema for the Graduate Project Management System (GPMS), aligned with the UML class diagram.

## Overview

The database follows Laravel 11 conventions with MySQL. All tables use `bigint` primary keys (`id`) and include `created_at` and `updated_at` timestamps unless otherwise specified.

## Core Tables

### Users & Authentication

#### `users`
Central authentication table for all user types.

**Columns:**
- `id` (bigint, primary key)
- `name` (string)
- `email` (string, nullable, unique) - Optional, used for password reset only
- `username` (string, unique) - **Primary login identifier**
- `password` (string, hashed)
- `role` (enum: `student`, `supervisor`, `discussion_committee`, `projects_committee`, `admin`)
- `phone` (string, nullable)
- `status` (enum: `active`, `inactive`, `suspended`)
- `email_verified_at` (timestamp, nullable)
- `remember_token` (string, nullable)
- `created_at`, `updated_at` (timestamps)

**Indexes:** `role`, `status`, `username`

**Notes:**
- Login is performed using `username` (not email)
- `username` is automatically derived from profile identifiers:
  - Students: `username = students.student_id`
  - Staff/committees: `username = supervisors.emp_id`
  - Admin: `username = 'admin'` (or 'admin2', 'admin3', etc. for multiple admins)
- `email` is optional and only used for password recovery functionality

#### `students`
Profile table for student-specific attributes (1:1 with `users`).

**Columns:**
- `id` (bigint, primary key)
- `user_id` (bigint, foreign key → `users.id`, unique)
- `student_id` (string, nullable)
- `major` (string, nullable)
- `academic_level` (string, nullable)
- `created_at`, `updated_at` (timestamps)

**Relationships:**
- `belongsTo(User)`

#### `supervisors`
Profile table for supervisor-specific attributes (1:1 with `users`).

**Columns:**
- `id` (bigint, primary key)
- `user_id` (bigint, foreign key → `users.id`, unique)
- `emp_id` (string, nullable)
- `department` (string, nullable)
- `created_at`, `updated_at` (timestamps)

**Relationships:**
- `belongsTo(User)`

### Projects & Proposals

#### `projects`
Main projects table.

**Columns:**
- `id` (bigint, primary key)
- `title` (string)
- `description` (text)
- `status` (enum: `draft`, `announced`, `available_for_registration`, `in_progress`, `completed`, `archived`)
- `supervisor_id` (bigint, foreign key → `users.id`, nullable)
- `max_students` (integer, default: 4)
- `current_students` (integer, default: 0)
- `specialization` (string, nullable)
- `keywords` (json, nullable)
- `project_committee_id` (bigint, foreign key → `project_committees.id`, nullable)
- `discussion_committee_id` (bigint, foreign key → `discussion_committees.id`, nullable)
- `supervisor_approval_status` (enum: `pending`, `approved`, `rejected`, nullable)
- `supervisor_approval_comments` (text, nullable)
- `supervisor_approval_at` (timestamp, nullable)
- `assigned_group_id` (bigint, foreign key → `student_groups.id`, nullable) - **Group assigned to this project**
- `reserved_at` (timestamp, nullable) - **When project was reserved for a group**
- `created_at`, `updated_at` (timestamps)

**Relationships:**
- `belongsTo(User)` - supervisor
- `belongsToMany(User)` - students (via `project_student`) - **All group members when group is registered**
- `belongsTo(StudentGroup)` - assigned group (via `assigned_group_id`)
- `belongsToMany(User)` - committee members (via `committee_assignments`)
- `belongsTo(ProjectCommittee)`
- `belongsTo(DiscussionCommittee)`
- `hasMany(Document)`
- `hasMany(Grade)`
- `hasMany(Proposal)`
- `hasMany(ProjectRegistration)` - registration records for all students
- `belongsToMany(TimePeriod)` - via `project_time_period`

**Indexes:** `supervisor_id`, `status`, `assigned_group_id`, `committee_id`

**Notes:**
- `assigned_group_id` is set when a group's proposal is approved or registration is approved
- When a group is assigned, all group members are added to `project_student` pivot
- `project_student` reflects actual registration state (all group members)
- `project_registrations` tracks the registration process (one record per student)

#### `proposals`
Proposal submissions from students or supervisors.

**Columns:**
- `id` (bigint, primary key)
- `title` (string)
- `description` (text)
- `submitter_id` (bigint, foreign key → `users.id`)
- `student_group_id` (bigint, foreign key → `student_groups.id`, nullable) - **Group submitting the proposal**
- `proposed_supervisor_id` (bigint, foreign key → `users.id`, nullable)
- `target_project_id` (bigint, foreign key → `projects.id`, nullable) - **Target project (during registration window)**
- `team_members` (json, nullable) - Array of student IDs (legacy, for individual proposals)
- `status` (enum: `pending_review`, `approved`, `rejected`, `requires_modification`)
- `review_notes` (text, nullable)
- `reviewed_by` (bigint, foreign key → `users.id`, nullable)
- `reviewed_at` (timestamp, nullable)
- `project_id` (bigint, foreign key → `projects.id`, nullable) - **Created project (if approved)**
- `created_at`, `updated_at` (timestamps)

**Relationships:**
- `belongsTo(User)` - submitter
- `belongsTo(User)` - reviewer
- `belongsTo(User)` - proposed supervisor
- `belongsTo(StudentGroup)` - group submitting the proposal
- `belongsTo(Project)` - target project (during registration)
- `belongsTo(Project)` - created project (if approved)

**Indexes:** `submitter_id`, `status`, `reviewed_by`, `student_group_id`, `target_project_id`, `(student_group_id, status)` composite

**Notes:**
- During `proposal_submission` window: `student_group_id` is optional (individual proposals allowed)
- During `project_registration` window: `student_group_id` is required
- After group creation: All proposals must have `student_group_id` (enforced by backend)
- When a group proposal is approved: Group is auto-registered to the project

### Groups

#### `student_groups`
**Independent student groups** that exist before project assignment (per Student Workflow specification).

**Columns:**
- `id` (bigint, primary key)
- `name` (string, nullable) - Optional group name
- `group_code` (string, unique, nullable) - Auto-generated code (e.g., GP-2026-0001)
- `leader_id` (bigint, foreign key → `users.id`) - Group leader
- `status` (enum: `active`, `archived`) - Group status
- `created_at`, `updated_at` (timestamps)

**Relationships:**
- `belongsTo(User)` - leader
- `belongsToMany(User)` - members (via `student_group_members`)
- `hasMany(Project)` - assigned projects (via `projects.assigned_group_id`)
- `hasMany(Proposal)` - proposals submitted by the group
- `hasMany(StudentGroupInvitation)` - group invitations
- `hasMany(StudentGroupJoinRequest)` - join requests

**Indexes:** `leader_id`, `status`, `group_code` (unique)

**Notes:**
- Groups are **independent entities** - they can exist without being assigned to a project
- Groups are created by students before or during project registration window
- A group can submit multiple proposals
- When a group's proposal is approved, the group is auto-registered to the project
- The group that creates a project becomes the assigned group

#### `student_group_members`
Pivot table for group members (many-to-many).

**Columns:**
- `id` (bigint, primary key)
- `group_id` (bigint, foreign key → `student_groups.id`)
- `student_id` (bigint, foreign key → `users.id`)
- `created_at`, `updated_at` (timestamps)

**Unique Constraint:** `(group_id, student_id)`
**Indexes:** `group_id`, `student_id`

**Notes:**
- Leader is stored in `student_groups.leader_id`, not in this pivot table
- Total group size = leader + members (min 2, max 5 per specification)

### Committees

#### `project_committees`
Project committees managing proposals and projects.

**Columns:**
- `id` (bigint, primary key)
- `name` (string)
- `department` (string, nullable)
- `created_at`, `updated_at` (timestamps)

**Relationships:**
- `belongsToMany(User)` - members (via `project_committee_user`)
- `hasMany(Project)`

#### `discussion_committees`
Discussion committees evaluating projects (2-3 members per project).

**Columns:**
- `id` (bigint, primary key)
- `name` (string)
- `department` (string, nullable)
- `created_at`, `updated_at` (timestamps)

**Relationships:**
- `belongsToMany(User)` - members (via `discussion_committee_user`)
- `hasMany(Project)`

#### `project_committee_user`
Pivot table for project committee members.

**Columns:**
- `id` (bigint, primary key)
- `project_committee_id` (bigint, foreign key → `project_committees.id`)
- `user_id` (bigint, foreign key → `users.id`)
- `created_at`, `updated_at` (timestamps)

**Unique Constraint:** `(project_committee_id, user_id)`

#### `discussion_committee_user`
Pivot table for discussion committee members.

**Columns:**
- `id` (bigint, primary key)
- `discussion_committee_id` (bigint, foreign key → `discussion_committees.id`)
- `user_id` (bigint, foreign key → `users.id`)
- `created_at`, `updated_at` (timestamps)

**Unique Constraint:** `(discussion_committee_id, user_id)`

#### `committee_assignments`
Pivot table assigning discussion committee members to projects (2-3 members per project).

**Columns:**
- `id` (bigint, primary key)
- `project_id` (bigint, foreign key → `projects.id`)
- `committee_member_id` (bigint, foreign key → `users.id`)
- `created_at`, `updated_at` (timestamps)

**Unique Constraint:** `(project_id, committee_member_id)`

### Documents & Grades

#### `documents`
Documents submitted for projects.

**Columns:**
- `id` (bigint, primary key)
- `type` (enum: `proposal`, `chapters`, `final_report`, `code`, `presentation`, `other`)
- `project_id` (bigint, foreign key → `projects.id`)
- `file_name` (string)
- `file_path` (string)
- `file_size` (bigint)
- `mime_type` (string)
- `submitted_by` (bigint, foreign key → `users.id`)
- `reviewed_by` (bigint, foreign key → `users.id`, nullable)
- `reviewed_at` (timestamp, nullable)
- `review_status` (enum: `pending`, `approved`, `rejected`)
- `review_comments` (text, nullable)
- `created_at`, `updated_at` (timestamps)

**Relationships:**
- `belongsTo(Project)`
- `belongsTo(User)` - submitter
- `belongsTo(User)` - reviewer

#### `grades`
Grades for students in projects.

**Columns:**
- `id` (bigint, primary key)
- `project_id` (bigint, foreign key → `projects.id`)
- `student_id` (bigint, foreign key → `users.id`)
- `supervisor_grade` (json, nullable) - `{score: float, comments: string}`
- `committee_grade` (json, nullable) - `{score: float, comments: string}`
- `final_grade` (decimal(5,2), nullable)
- `is_approved` (boolean, default: false)
- `approved_at` (timestamp, nullable)
- `approved_by` (bigint, foreign key → `users.id`, nullable)
- `created_at`, `updated_at` (timestamps)

**Unique Constraint:** `(project_id, student_id)`

**Relationships:**
- `belongsTo(Project)`
- `belongsTo(User)` - student
- `belongsTo(User)` - approver

### Requests & Notifications

#### `requests`
Student requests (change supervisor, group, project, etc.).

**Columns:**
- `id` (bigint, primary key)
- `type` (enum: `change_supervisor`, `change_group`, `change_project`, `other`)
- `student_id` (bigint, foreign key → `users.id`)
- `project_id` (bigint, foreign key → `projects.id`, nullable)
- `reason` (text)
- `status` (enum: `pending`, `supervisor_approved`, `supervisor_rejected`, `committee_approved`, `committee_rejected`, `cancelled`)
- `supervisor_approval` (json, nullable)
- `committee_approval` (json, nullable)
- `additional_data` (json, nullable)
- `created_at`, `updated_at` (timestamps)

**Relationships:**
- `belongsTo(User)` - student
- `belongsTo(Project)`

#### `notifications`
User notifications with polymorphic relationships.

**Columns:**
- `id` (bigint, primary key)
- `user_id` (bigint, foreign key → `users.id`)
- `message` (string)
- `is_read` (boolean, default: false)
- `type` (string, nullable)
- `related_entity_type` (string, nullable) - Polymorphic type
- `related_entity_id` (bigint, nullable) - Polymorphic ID
- `read_at` (timestamp, nullable)
- `created_at`, `updated_at` (timestamps)

**Relationships:**
- `belongsTo(User)`
- `morphTo('related_entity')` - Can relate to Project, Proposal, etc.

### Time Periods

#### `time_periods`
Time windows for various activities (proposal submission, registration, etc.).

**Columns:**
- `id` (bigint, primary key)
- `name` (string)
- `type` (string) - e.g., `proposal_submission`, `project_registration`, `document_submission`
- `start_date` (date)
- `end_date` (date)
- `is_active` (boolean, default: true)
- `academic_year` (string, nullable)
- `semester` (string, nullable)
- `description` (text, nullable)
- `created_by` (bigint, foreign key → `users.id`)
- `created_at`, `updated_at` (timestamps)

**Relationships:**
- `belongsTo(User)` - creator
- `belongsToMany(Project)` - via `project_time_period`

#### `project_time_period`
Pivot table linking projects to time periods (many-to-many aggregation).

**Columns:**
- `id` (bigint, primary key)
- `project_id` (bigint, foreign key → `projects.id`)
- `time_period_id` (bigint, foreign key → `time_periods.id`)
- `created_at`, `updated_at` (timestamps)

**Unique Constraint:** `(project_id, time_period_id)`

## Additional Tables

#### `project_registrations`
**Registration records for students** (tracks the registration process).

**Columns:**
- `id` (bigint, primary key)
- `project_id` (bigint, foreign key → `projects.id`)
- `student_id` (bigint, foreign key → `users.id`)
- `status` (enum: `pending`, `approved`, `rejected`, `cancelled`)
- `submitted_at` (timestamp)
- `reviewed_at` (timestamp, nullable)
- `reviewed_by` (bigint, foreign key → `users.id`, nullable)
- `review_comments` (text, nullable)
- `created_at`, `updated_at` (timestamps)

**Unique Constraint:** `(project_id, student_id)`
**Indexes:** `project_id`, `student_id`, `status`, `(project_id, status)` composite

**Relationships:**
- `belongsTo(Project)`
- `belongsTo(User)` - student
- `belongsTo(User)` - reviewer

**Notes:**
- **One record per student** - even for group registrations, each group member has their own record
- When a group registers: One `pending` record is created for the submitter, then all members get `approved` records when approved
- When a group proposal is approved: All group members get `approved` records created automatically
- `project_student` pivot reflects actual registration (all approved students)
- `project_registrations` tracks the registration process (status, review, etc.)

#### `project_student`
**Pivot table** linking students to projects (reflects actual registration state).

**Columns:**
- `id` (bigint, primary key)
- `project_id` (bigint, foreign key → `projects.id`)
- `student_id` (bigint, foreign key → `users.id`)
- `created_at`, `updated_at` (timestamps)

**Unique Constraint:** `(project_id, student_id)`
**Indexes:** `project_id`, `student_id`

**Notes:**
- **Reflects actual registration state** - students in this table are registered in the project
- When a group is registered: All group members are added to this pivot table
- Should be in sync with `project_registrations` where `status = 'approved'`
- Used for queries like "get all students in a project" or "is student registered in project"

The system also includes these supporting tables:
- `student_group_invitations` - Group invitation system
- `student_group_join_requests` - Join requests for groups
- `supervisor_notes` - Notes from supervisors
- `note_replies` - Replies to supervisor notes
- `project_milestones` - Project milestones
- `project_meetings` - Project meetings
- `project_meeting_attendee` - Meeting attendees pivot

## Relationships Summary

### One-to-Many
- User → Proposals (as submitter)
- User → Projects (as supervisor)
- User → Requests
- User → Notifications
- User → Documents (as submitter)
- User → Grades (as student)
- Project → Documents
- Project → Grades
- Project → Proposals
- ProjectCommittee → Projects
- DiscussionCommittee → Projects

### Many-to-Many
- User ↔ Projects (via `project_student`) - **Actual registration state**
- User ↔ StudentGroups (via `student_group_members`) - **Group membership**
- User ↔ ProjectCommittees (via `project_committee_user`)
- User ↔ DiscussionCommittees (via `discussion_committee_user`)
- User ↔ Projects (via `committee_assignments`) - Discussion committee members
- Project ↔ TimePeriods (via `project_time_period`)

### One-to-Many
- StudentGroup → Projects (via `projects.assigned_group_id`) - **Groups can have multiple projects over time**
- StudentGroup → Proposals (via `proposals.student_group_id`) - **Groups can submit multiple proposals**

### One-to-One
- User ↔ Student (via `students.user_id`)
- User ↔ Supervisor (via `supervisors.user_id`)
- Project ↔ StudentGroup (via `projects.assigned_group_id`) - **One group per project (when assigned)**

### Workflow Relationships (Student Workflow)
1. **Group Creation**: `student_groups` (independent) → `student_group_members` (members)
2. **Proposal Submission**: `proposals.student_group_id` → `student_groups.id` (optional during proposal_submission, required during project_registration)
3. **Proposal Approval**: `proposals` → creates/links `projects` → auto-registers group
4. **Group Registration**: `project_registrations` (one per student) → `project_student` (all members) → `projects.assigned_group_id`
5. **Registration State**: `project_student` reflects actual registration, `project_registrations` tracks process

## Seeders

The database includes essential seeders for system initialization and testing:

1. **UsersSeeder** - Creates users for all roles with profiles (students, supervisors, committees, admin)
2. **SettingsSeeder** - Creates system settings (group min/max members, etc.)
3. **TimePeriodsSeeder** - Creates time periods for various activities
4. **CommitteesSeeder** - Creates committees and assigns members
5. **ProposalsSeeder** - Creates proposals with various statuses
6. **ProjectCommitteeWorkflowSeeder** - Creates test data for Project Committee workflow testing

**Note:** The `DatabaseSeeder` class orchestrates the seeding process and calls the essential seeders in the correct order. Additional seeders can be run individually for specific testing scenarios. Demo data seeders (ProjectsSeeder, DocumentsSeeder, GradesSeeder, RequestsSeeder) have been removed as they are no longer needed for production/testing.

Run all seeders:
```bash
php artisan migrate:fresh --seed
```

Run individual seeders:
```bash
php artisan db:seed --class=UsersSeeder
php artisan db:seed --class=SettingsSeeder
# etc.
```

## Factories

All models have corresponding factories for testing and seeding:
- `UserFactory` - With role states (student, supervisor, committee, admin)
- `ProjectFactory` - With status states
- `ProposalFactory` - With status states
- `TimePeriodFactory` - With active/inactive states
- `DocumentFactory` - With approval states
- `GradeFactory` - With complete/partial states
- `ProjectRequestFactory` - With status states
- `NotificationFactory` - With read/unread states
- `ProjectCommitteeFactory`
- `DiscussionCommitteeFactory`

## Notes

- All foreign keys use `onDelete('cascade')` or `onDelete('set null')` as appropriate
- Pivot tables include unique constraints to prevent duplicates
- Enum values match the UML diagram specifications
- The schema supports the UML relationships including the 2-3 member constraint for discussion committees
- Polymorphic relationships are used for notifications to link to various entities
