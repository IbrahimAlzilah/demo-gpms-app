---
description: End-to-end evaluation and defense workflow for Final Discussion 1 & 2
---

# Evaluation and Defense Workflow

This workflow describes the complete evaluation and defense flow including committee assignment, supervisor evaluation, discussion committee evaluation, grade approval, and announcement.

## Overview

The evaluation and defense flow consists of the following phases:

### Phase 1: Chapter Submission & Final Discussion 1 (Semesters 1-3)
1. Students submit project documents (chapters 1-3)
2. Project Committee forms discussion committees (2-3 members each)
3. Discussion committees evaluate projects and enter grades
4. Project supervisors enter individual student grades
5. Project Committee reviews and approves grades
6. Grades are published to students

### Phase 2: Chapter Submission & Final Discussion 2 (Semesters 4-6)
1. Students submit project documents (chapters 4-6 + final report)
2. Same flow as Phase 1

## Key Pages & Components

### 1. Committee Distribution Page (`/committee/distribute`)
- **Access**: Projects Committee only
- **Purpose**: Assign discussion committee members to projects
- **Features**:
  - Show all projects ready for final discussion
  - Filter by project status (in_progress, ready_for_defense, etc.)
  - Display discussion committee member profiles with:
    - Name, department, expertise
    - Current assignment count
    - Previous projects assigned
    - Availability status
  - Bulk and individual assignment
  - Validation: 2-3 members per project

### 2. Discussion Committee Projects Page (`/discussion/projects`)
- **Access**: Discussion Committee only
- **Purpose**: View all assigned projects with documents
- **Features**:
  - List of assigned projects
  - Read-only access to all project data
  - View all submitted documents
  - Download capabilities

### 3. Discussion Committee Evaluation Page (`/discussion/evaluation`)
- **Access**: Discussion Committee only
- **Purpose**: Enter evaluation grades for assigned projects
- **Features**:
  - Per-student evaluation
  - Structured grading form with criteria
  - Notes/comments section
  - View supervisor grades (if submitted)

### 4. Supervisor Evaluation Page (`/supervisor/projects/:id`)
- **Access**: Project Supervisor only
- **Purpose**: Grade individual students
- **Features**:
  - Per-student grading (each student graded individually)
  - Structured grading form
  - Comments per student
  - Submit all grades action

### 5. Grades Management Page (`/committee/grades`)
- **Access**: Projects Committee only
- **Purpose**: Review, approve, and publish grades
- **Features**:
  - View all project grades
  - Both supervisor and committee grades visible
  - Approval workflow
  - Publish/announce grades to students
  - Filter by approval status

## Backend API Endpoints

### Projects Committee
- `GET /api/projects-committee/projects?status=in_progress` - Get projects for distribution
- `GET /api/projects-committee/committees/members` - Get available committee members with stats
- `POST /api/projects-committee/committees/distribute` - Assign members to projects
- `GET /api/projects-committee/grades` - Get all grades for review
- `POST /api/projects-committee/grades/:id/approve` - Approve grade
- `POST /api/projects-committee/grades/publish` - Publish grades to students

### Discussion Committee
- `GET /api/discussion-committee/projects` - Get assigned projects
- `GET /api/discussion-committee/projects/:id` - Get project details with documents
- `GET /api/discussion-committee/evaluations` - Get evaluations list
- `POST /api/discussion-committee/evaluations` - Submit evaluation

### Supervisor
- `GET /api/supervisor/projects` - Get supervised projects
- `GET /api/supervisor/projects/:id/grades` - Get grades for project
- `GET /api/supervisor/evaluations?project_id=x` - Get evaluations
- `POST /api/supervisor/evaluations` - Submit evaluation

## Time Windows

The evaluation flow respects these time windows:
- `chapter_submission_phase_1` - Student chapter submission (semesters 1-3)
- `final_defense_phase_1` - Discussion committee evaluation (after phase 1 submissions)
- `chapter_submission_phase_2` - Student chapter submission (semesters 4-6)
- `final_defense_phase_2` - Discussion committee evaluation (after phase 2 submissions)
- `grade_approval` - Project committee grade approval

## Database Tables

- `grades` - Stores supervisor and committee grades per student/project
- `committee_assignments` - Links committee members to projects
- `documents` - Stores submitted project documents
- `time_periods` - Defines active time windows

## Implementation Tasks

// turbo-all
1. Enhance CommitteeController with member statistics and profiles
2. Update DistributeCommitteesPage with filtering and member profiles
3. Enhance DiscussionCommittee project view with document access
4. Improve Supervisor evaluation per-student workflow
5. Add grade approval and publishing to ProjectsCommittee GradesPage
6. Add proper i18n translations for all new UI elements
7. Add time window validation where needed
