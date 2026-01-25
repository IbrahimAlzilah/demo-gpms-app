# Plan: Remove Student-Initiated Supervision Requests

## Overview
Remove student-initiated supervision requests and ensure only Project Committee can assign supervisors to projects.

## Areas to Review and Update

### 1. Frontend - Student Routes & UI
**Files to check:**
- `frontend/src/pages/student/requests/` - Any request creation pages
- `frontend/src/routes/config.tsx` - Student request routes
- Student dashboard/components - Request creation buttons

**Actions:**
- Remove "Create Supervision Request" or "Request Supervisor" buttons
- Remove request creation forms/pages for students
- Remove request-related routes from student section
- Keep view-only access for students to see their assigned supervisors

### 2. Frontend - API Services
**Files to check:**
- `frontend/src/pages/student/requests/api/` - Request service
- Any hooks that create supervision requests

**Actions:**
- Remove or disable `createRequest` methods for students
- Update types/interfaces if needed

### 3. Backend - API Routes
**Files to check:**
- `backend/routes/api.php` - Student request routes

**Actions:**
- Remove or restrict POST routes for student supervision requests:
  - `POST /student/requests` - Remove or block
  - `PUT /student/requests/{id}` - Review if needed
  - Keep GET routes for viewing only

### 4. Backend - Controllers
**Files to check:**
- `backend/app/Http/Controllers/Student/RequestController.php`

**Actions:**
- Update `store()` method to reject supervision requests from students
- Add validation to check request type and user role
- Return 403 Forbidden for student-initiated supervision requests

### 5. Backend - Policies
**Files to check:**
- `backend/app/Policies/RequestPolicy.php` (if exists)

**Actions:**
- Update `create()` method to deny students creating supervision requests
- Ensure Project Committee can still create/assign supervisors

### 6. Backend - Services
**Files to check:**
- `backend/app/Services/RequestService.php` or similar
- `backend/app/Services/ProjectService.php` - Supervisor assignment

**Actions:**
- Update business logic to prevent student-initiated requests
- Ensure Project Committee assignment logic remains intact
- Update validation methods

### 7. Backend - Models
**Files to check:**
- `backend/app/Models/ProjectRequest.php` or similar

**Actions:**
- Review model relationships
- Ensure data integrity is maintained
- Check if any scopes need updating

### 8. Database Migrations
**Actions:**
- Review if any migration changes are needed
- Ensure existing data remains valid
- Consider soft-deleting or archiving existing student-initiated requests

## Implementation Steps

1. **Backend First (API Protection)**
   - Update RequestController to block student requests
   - Update validation and policies
   - Test API endpoints

2. **Frontend Updates**
   - Remove UI components
   - Remove routes
   - Update navigation/menus
   - Test UI changes

3. **Verification**
   - Test that students cannot create requests
   - Test that Project Committee can still assign supervisors
   - Verify data integrity
   - Check permissions

## Key Validation Rules

- Students: Can only VIEW assigned supervisors, cannot REQUEST supervisors
- Project Committee: Can ASSIGN supervisors to projects
- Supervisors: Can VIEW and RESPOND to assignments (if applicable)

## Notes

- Maintain backward compatibility for existing assigned supervisors
- Keep view-only access for students to see their supervisor information
- Ensure Project Committee workflow remains fully functional
