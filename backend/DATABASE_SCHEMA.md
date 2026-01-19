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
- `created_at`, `updated_at` (timestamps)

**Relationships:**
- `belongsTo(User)` - supervisor
- `belongsToMany(User)` - students (via `project_student`)
- `hasOne(ProjectGroup)`
- `belongsToMany(User)` - committee members (via `committee_assignments`)
- `belongsTo(ProjectCommittee)`
- `belongsTo(DiscussionCommittee)`
- `hasMany(Document)`
- `hasMany(Grade)`
- `hasMany(Proposal)`
- `belongsToMany(TimePeriod)` - via `project_time_period`

#### `proposals`
Proposal submissions from students or supervisors.

**Columns:**
- `id` (bigint, primary key)
- `title` (string)
- `description` (text)
- `requirements` (text, nullable)
- `submitter_id` (bigint, foreign key → `users.id`)
- `proposed_supervisor_id` (bigint, foreign key → `users.id`, nullable)
- `team_members` (json, nullable) - Array of student IDs
- `status` (enum: `pending_review`, `approved`, `rejected`, `requires_modification`)
- `review_notes` (text, nullable)
- `reviewed_by` (bigint, foreign key → `users.id`, nullable)
- `reviewed_at` (timestamp, nullable)
- `project_id` (bigint, foreign key → `projects.id`, nullable)
- `created_at`, `updated_at` (timestamps)

**Relationships:**
- `belongsTo(User)` - submitter
- `belongsTo(User)` - reviewer
- `belongsTo(User)` - proposed supervisor
- `belongsTo(Project)` - linked project (if approved)

### Groups

#### `project_groups`
Groups working on projects (1:1 with projects).

**Columns:**
- `id` (bigint, primary key)
- `project_id` (bigint, foreign key → `projects.id`, unique)
- `leader_id` (bigint, foreign key → `users.id`)
- `max_members` (integer, default: 4)
- `group_name` (string, nullable)
- `created_at`, `updated_at` (timestamps)

**Relationships:**
- `belongsTo(Project)`
- `belongsTo(User)` - leader
- `belongsToMany(User)` - members (via `project_group_member`)

#### `project_group_member`
Pivot table for group members (many-to-many).

**Columns:**
- `id` (bigint, primary key)
- `group_id` (bigint, foreign key → `project_groups.id`)
- `member_id` (bigint, foreign key → `users.id`)
- `created_at`, `updated_at` (timestamps)

**Unique Constraint:** `(group_id, member_id)`

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

The system also includes these supporting tables:
- `project_registrations` - Student registrations for projects
- `group_invitations` - Group invitation system
- `group_join_requests` - Join requests for groups
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
- User ↔ Projects (via `project_student`)
- User ↔ ProjectGroups (via `project_group_member`)
- User ↔ ProjectCommittees (via `project_committee_user`)
- User ↔ DiscussionCommittees (via `discussion_committee_user`)
- User ↔ Projects (via `committee_assignments`) - Discussion committee members
- Project ↔ TimePeriods (via `project_time_period`)

### One-to-One
- User ↔ Student (via `students.user_id`)
- User ↔ Supervisor (via `supervisors.user_id`)
- Project ↔ ProjectGroup (via `project_groups.project_id`)

## Seeders

The database includes comprehensive seeders for demo data:

1. **UsersSeeder** - Creates users for all roles with profiles
2. **CommitteesSeeder** - Creates committees and assigns members
3. **ProjectsSeeder** - Creates projects with various statuses
4. **GroupsSeeder** - Creates project groups
5. **ProposalsSeeder** - Creates proposals with various statuses
6. **TimePeriodsSeeder** - Creates time periods
7. **DocumentsSeeder** - Creates documents for projects
8. **GradesSeeder** - Creates grades for students
9. **RequestsSeeder** - Creates project requests
10. **NotificationsSeeder** - Creates notifications

Run seeders:
```bash
php artisan migrate:fresh --seed
```

## Factories

All models have corresponding factories for testing and seeding:
- `UserFactory` - With role states (student, supervisor, committee, admin)
- `ProjectFactory` - With status states
- `ProposalFactory` - With status states
- `ProjectGroupFactory`
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
