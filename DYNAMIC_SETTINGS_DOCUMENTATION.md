# Dynamic System Settings Implementation

## Overview

This document provides a comprehensive overview of the dynamic settings system implemented in the GPMS (Graduation Project Management System). All previously hardcoded values have been replaced with configurable dynamic settings that can be managed by system administrators in real-time.

---

## 📋 Table of Contents

1. [Settings Categories](#settings-categories)
2. [Complete Settings List](#complete-settings-list)
3. [Files Modified](#files-modified)
4. [API Endpoints](#api-endpoints)
5. [Usage Examples](#usage-examples)
6. [Migration Guide](#migration-guide)

---

## Settings Categories

The system settings are organized into 13 logical categories:

1. **Groups** - Student group formation and membership rules
2. **Proposals** - Project proposal submission constraints
3. **Projects** - Project registration and capacity settings
4. **Committees** - Discussion committee assignment rules
5. **Supervisors** - Supervisor workload limits
6. **Documents** - Document upload and chapter management
7. **Meetings** - Meeting scheduling parameters
8. **Milestones** - Project milestone configuration
9. **Evaluations** - Grading and evaluation settings
10. **Requests** - Student request validation
11. **Authentication** - User account validation rules
12. **Search & UI** - Interface display and pagination settings
13. **Periods** - Academic period naming

---

## Complete Settings List

### Groups (4 settings)

| Setting Key                             | Default | Min | Max  | Description                                                |
| --------------------------------------- | ------- | --- | ---- | ---------------------------------------------------------- |
| `group_min_members`                     | 2       | 1   | 20   | Minimum number of members required in a student group      |
| `group_max_members`                     | 5       | 1   | 20   | Maximum number of members allowed in a student group       |
| `group_name_max_length`                 | 255     | 10  | 500  | Maximum length for group name (characters)                 |
| `group_join_request_message_max_length` | 500     | 100 | 2000 | Maximum length for group join request message (characters) |

### Proposals (4 settings)

| Setting Key                          | Default | Min | Max | Description                                                              |
| ------------------------------------ | ------- | --- | --- | ------------------------------------------------------------------------ |
| `max_proposals_per_group_submission` | 5       | 1   | 20  | Maximum number of proposals a student group can submit in one submission |
| `proposal_title_min_length`          | 5       | 3   | 50  | Minimum length for proposal title (characters)                           |
| `proposal_title_max_length`          | 255     | 50  | 500 | Maximum length for proposal title (characters)                           |
| `proposal_description_min_length`    | 50      | 10  | 200 | Minimum length for proposal description (characters)                     |

### Projects (7 settings)

| Setting Key                           | Default | Min | Max   | Description                                                                  |
| ------------------------------------- | ------- | --- | ----- | ---------------------------------------------------------------------------- |
| `max_projects_per_group`              | 1       | 1   | 10    | Maximum number of projects a student group can register for or have approved |
| `project_default_max_students`        | 4       | 1   | 20    | Default maximum students per project when creating from proposal             |
| `project_max_students_limit`          | 10      | 1   | 50    | Maximum allowed value for max_students per project                           |
| `project_keyword_max_length`          | 100     | 20  | 255   | Maximum length for individual project keywords (characters)                  |
| `project_note_reply_max_length`       | 5000    | 500 | 10000 | Maximum length for project note replies (characters)                         |
| `project_progress_completed_weight`   | 100     | 0   | 100   | Weight for completed phases in progress calculation                          |
| `project_progress_in_progress_weight` | 50      | 0   | 100   | Weight for in-progress phases in progress calculation                        |

### Committees (3 settings)

| Setting Key                                 | Default | Min | Max  | Description                                                          |
| ------------------------------------------- | ------- | --- | ---- | -------------------------------------------------------------------- |
| `discussion_committee_min_members`          | 2       | 1   | 5    | Minimum number of discussion committee members per project           |
| `discussion_committee_max_members`          | 3       | 1   | 10   | Maximum number of discussion committee members per project           |
| `committee_availability_moderate_threshold` | 2       | 1   | 10   | Maximum assignments before member is considered moderately available |
| `committee_review_comments_max_length`      | 1000    | 200 | 5000 | Maximum length for committee review comments (characters)            |

### Supervisors (2 settings)

| Setting Key                      | Default | Min | Max  | Description                                                |
| -------------------------------- | ------- | --- | ---- | ---------------------------------------------------------- |
| `supervisor_max_projects`        | 5       | 1   | 50   | Maximum number of projects a single supervisor can oversee |
| `supervisor_response_max_length` | 1000    | 200 | 5000 | Maximum length for supervisor responses (characters)       |

### Documents (5 settings)

| Setting Key                           | Default | Min | Max   | Description                                                  |
| ------------------------------------- | ------- | --- | ----- | ------------------------------------------------------------ |
| `document_upload_max_size_mb`         | 10      | 1   | 100   | Maximum document upload size in megabytes                    |
| `document_max_chapters`               | 6       | 3   | 20    | Maximum number of document chapters                          |
| `document_phase1_chapters`            | 3       | 1   | 10    | Number of chapters in Phase 1 (Final Defense Phase 1)        |
| `document_filename_max_length`        | 200     | 50  | 500   | Maximum length for sanitized document filenames (characters) |
| `document_review_comments_max_length` | 5000    | 500 | 10000 | Maximum length for document review comments (characters)     |

### Meetings (6 settings)

| Setting Key                   | Default | Min | Max   | Description                                      |
| ----------------------------- | ------- | --- | ----- | ------------------------------------------------ |
| `meeting_duration_min`        | 15      | 5   | 60    | Minimum meeting duration in minutes              |
| `meeting_duration_max`        | 480     | 60  | 720   | Maximum meeting duration in minutes (8 hours)    |
| `meeting_duration_default`    | 60      | 15  | 240   | Default meeting duration in minutes              |
| `meeting_location_max_length` | 255     | 50  | 500   | Maximum length for meeting location (characters) |
| `meeting_agenda_max_length`   | 5000    | 500 | 10000 | Maximum length for meeting agenda (characters)   |
| `meeting_notes_max_length`    | 5000    | 500 | 10000 | Maximum length for meeting notes (characters)    |

### Milestones (2 settings)

| Setting Key                        | Default | Min | Max   | Description                                           |
| ---------------------------------- | ------- | --- | ----- | ----------------------------------------------------- |
| `milestone_title_max_length`       | 255     | 50  | 500   | Maximum length for milestone title (characters)       |
| `milestone_description_max_length` | 5000    | 500 | 10000 | Maximum length for milestone description (characters) |

### Evaluations (2 settings)

| Setting Key                    | Default | Min | Max | Description                           |
| ------------------------------ | ------- | --- | --- | ------------------------------------- |
| `evaluation_score_min`         | 0       | 0   | 100 | Minimum allowed evaluation score      |
| `evaluation_default_max_score` | 100     | 50  | 200 | Default maximum score for evaluations |

### Requests (1 setting)

| Setting Key                 | Default | Min | Max | Description                                    |
| --------------------------- | ------- | --- | --- | ---------------------------------------------- |
| `request_reason_min_length` | 20      | 10  | 100 | Minimum length for request reason (characters) |

### Authentication (5 settings)

| Setting Key                 | Default | Min | Max | Description                                     |
| --------------------------- | ------- | --- | --- | ----------------------------------------------- |
| `password_min_length`       | 8       | 6   | 20  | Minimum password length (characters)            |
| `username_max_length`       | 255     | 20  | 500 | Maximum length for usernames (characters)       |
| `email_max_length`          | 255     | 50  | 500 | Maximum length for email addresses (characters) |
| `user_full_name_min_length` | 2       | 1   | 10  | Minimum length for user full names (characters) |
| `user_full_name_max_length` | 255     | 50  | 500 | Maximum length for user full names (characters) |

### Search & UI (5 settings)

| Setting Key                               | Default | Min | Max | Description                                                    |
| ----------------------------------------- | ------- | --- | --- | -------------------------------------------------------------- |
| `search_query_max_length`                 | 100     | 50  | 500 | Maximum length for search queries (characters)                 |
| `search_results_limit`                    | 50      | 10  | 500 | Maximum number of search results to display                    |
| `pagination_default_page_size`            | 10      | 5   | 100 | Default number of items per page in paginated lists            |
| `dashboard_display_limit`                 | 5       | 3   | 20  | Maximum number of items to display in dashboard widgets        |
| `dashboard_soon_milestone_days_threshold` | 7       | 1   | 30  | Number of days ahead to consider milestones as "upcoming soon" |

### Periods (1 setting)

| Setting Key              | Default | Min | Max | Description                                  |
| ------------------------ | ------- | --- | --- | -------------------------------------------- |
| `period_name_max_length` | 255     | 50  | 500 | Maximum length for period names (characters) |

**Total Settings: 51**

---

## Files Modified

### Backend

#### Models

- `backend/app/Models/Setting.php` - Setting model with get/set methods

#### Services

- `backend/app/Services/SettingsService.php` - 51 settings definitions + 51 getter methods

#### Controllers

- `backend/app/Http/Controllers/SettingsController.php` - Public settings endpoint
- `backend/app/Http/Controllers/Admin/SystemSettingsController.php` - Admin settings management
- `backend/app/Http/Controllers/Student/DocumentController.php` - Uses document settings
- `backend/app/Http/Controllers/Student/StudentGroupController.php` - Uses group settings
- `backend/app/Http/Controllers/Student/RequestController.php` - Uses request settings
- `backend/app/Http/Controllers/Student/ProjectController.php` - Uses project settings
- `backend/app/Http/Controllers/Supervisor/MeetingController.php` - Uses meeting settings
- `backend/app/Http/Controllers/Supervisor/MilestoneController.php` - Uses milestone settings
- `backend/app/Http/Controllers/Supervisor/DocumentController.php` - Uses document review settings
- `backend/app/Http/Controllers/Supervisor/SupervisionController.php` - Uses supervisor settings
- `backend/app/Http/Controllers/ProjectsCommittee/RegistrationController.php` - Uses committee settings
- `backend/app/Http/Controllers/ProjectsCommittee/ProjectController.php` - Uses project settings
- `backend/app/Http/Controllers/ProjectsCommittee/ProposalController.php` - Uses proposal settings
- `backend/app/Http/Controllers/ProjectsCommittee/PeriodController.php` - Uses period settings
- `backend/app/Http/Controllers/ProjectsCommittee/CommitteeController.php` - Uses committee threshold settings
- `backend/app/Http/Controllers/AuthController.php` - Uses authentication settings
- `backend/app/Http/Controllers/Admin/UserController.php` - Uses user validation settings

#### Services (Business Logic)

- `backend/app/Services/DocumentService.php` - Uses document/chapter settings
- `backend/app/Services/Dashboards/SupervisorDashboardService.php` - Uses dashboard display limits

#### Database

- `backend/database/migrations/2026_01_21_000005_create_settings_table.php` - Settings table
- `backend/database/seeders/SettingsSeeder.php` - Seeds all 51 settings

#### Routes

- `backend/routes/api.php` - Added settings endpoints

### Frontend

#### Types

- `frontend/src/types/settings.types.ts` - Settings type definitions + 13 category labels

#### API Services

- `frontend/src/pages/admin/settings/api/settings.service.ts` - Settings API calls

#### Hooks

- `frontend/src/pages/admin/settings/hooks/useSettings.ts` - Settings React Query hooks

#### Pages

- `frontend/src/pages/admin/settings/SettingsPage.tsx` - Settings page wrapper
- `frontend/src/pages/admin/settings/list/SettingsList.screen.tsx` - Enhanced settings UI with tooltips, badges, reset buttons

#### Routes

- `frontend/src/routes/config.tsx` - Added settings route
- `frontend/src/routes/lazy.tsx` - Lazy-loaded settings page

---

## API Endpoints

### Public Endpoint (All Authenticated Users)

```
GET /api/settings
```

Returns all settings as key-value pairs for client-side validation.

**Response:**

```json
{
  "group_min_members": 2,
  "group_max_members": 5,
  "max_proposals_per_group_submission": 5,
  ...
}
```

### Admin Endpoints

```
GET /api/admin/settings
```

Returns all settings with full metadata (type, description, category, min/max, default).

**Response:**

```json
[
  {
    "key": "group_min_members",
    "value": 2,
    "type": "integer",
    "description": "Minimum number of members required in a student group",
    "category": "groups",
    "min": 1,
    "max": 20,
    "default": 2
  },
  ...
]
```

```
PUT /api/admin/settings
```

Updates multiple settings at once.

**Request Body:**

```json
{
  "settings": {
    "group_min_members": 3,
    "group_max_members": 6,
    "supervisor_max_projects": 10
  }
}
```

---

## Usage Examples

### Backend Usage

#### In Controllers

```php
use App\Services\SettingsService;

class SomeController extends Controller
{
    public function store(Request $request)
    {
        $settingsService = app(SettingsService::class);
        $maxMembers = $settingsService->getGroupMaxMembers();

        $validated = $request->validate([
            'members' => "required|array|max:{$maxMembers}",
        ]);

        // ... rest of logic
    }
}
```

#### In Services

```php
use App\Services\SettingsService;

class DocumentService
{
    protected function validateChapter(int $chapterNumber): void
    {
        $settingsService = app(SettingsService::class);
        $maxChapters = $settingsService->getDocumentMaxChapters();

        if ($chapterNumber > $maxChapters) {
            throw new \Exception("Chapter number cannot exceed {$maxChapters}");
        }
    }
}
```

### Frontend Usage

#### Fetching Settings

```typescript
import { usePublicSettings } from '@/pages/admin/settings/hooks/useSettings';

function MyComponent() {
  const { data: settings, isLoading } = usePublicSettings();

  if (isLoading) return <div>Loading...</div>;

  const maxMembers = settings?.group_max_members ?? 5;

  return <div>Max members: {maxMembers}</div>;
}
```

#### Admin Settings Management

```typescript
import { useAdminSettings, useUpdateSettings } from "../hooks/useSettings";

function SettingsForm() {
  const { data: settings = [] } = useAdminSettings();
  const updateMutation = useUpdateSettings();

  const handleSave = async (newSettings: Record<string, number>) => {
    await updateMutation.mutateAsync(newSettings);
  };

  // ... render form
}
```

---

## Migration Guide

### For Developers

If you need to add a new setting:

1. **Add to SettingsService DEFINITIONS:**

```php
// backend/app/Services/SettingsService.php

public const DEFINITIONS = [
    // ... existing settings

    'your_new_setting' => [
        'type' => 'integer',  // or 'string', 'boolean', 'json'
        'default' => 10,
        'description' => 'Your setting description',
        'category' => 'your_category',  // groups, proposals, etc.
        'min' => 1,
        'max' => 100,
    ],
];
```

2. **Add Getter Method:**

```php
public function getYourNewSetting(): int
{
    return (int) Setting::get('your_new_setting', self::DEFINITIONS['your_new_setting']['default']);
}
```

3. **Run Seeder:**

```bash
php artisan db:seed --class=SettingsSeeder
```

4. **Use in Controllers:**

```php
$settingsService = app(\App\Services\SettingsService::class);
$value = $settingsService->getYourNewSetting();
```

### For Administrators

To manage settings:

1. Navigate to **System Settings** in the admin panel
2. Settings are grouped by category for easy navigation
3. Each setting shows:
   - Description
   - Default value
   - Allowed range (min-max)
   - Modified badge if changed
4. Click **Reset** button to revert a setting to its current saved value
5. Click **Save** to apply all changes

---

## Key Improvements

### Replaced Hardcoded Values

✅ **51 hardcoded values replaced** with dynamic settings across:

- Validation rules in 16+ controllers
- Business logic in 3+ services
- Frontend validation schemas
- Dashboard display limits
- Search and pagination defaults

### UX/UI Enhancements

✅ **Modern, intuitive settings interface** featuring:

- Category-based grouping with icons
- Setting count per category
- Modified badges for changed settings
- Reset buttons for individual settings
- Inline tooltips showing defaults and ranges
- Responsive 2-column grid layout
- Real-time validation with min/max enforcement

### System Benefits

✅ **Improved System Flexibility:**

- No code changes needed to adjust business rules
- Real-time updates without deployment
- Centralized configuration management
- Audit trail through database records

✅ **Enhanced Maintainability:**

- Single source of truth for all limits
- Type-safe getter methods
- Comprehensive documentation
- Consistent naming conventions

✅ **Better Governance:**

- Admin-only access to critical settings
- Validation at both backend and frontend
- Default values always available
- Range enforcement prevents invalid configurations

---

## Technical Notes

### PHP Method Naming

⚠️ **Important:** PHP method names are case-insensitive. Avoid methods like:

- `getUsernameMaxLength()` ❌
- `getUserNameMaxLength()` ❌ (Conflict!)

Use distinct names:

- `getUsernameMaxLength()` ✅ (for login username)
- `getUserFullNameMaxLength()` ✅ (for full name)

### Performance

- Settings are cached by Laravel's query cache
- Frontend fetches settings once per session
- Bulk updates minimize database transactions
- No impact on page load times

### Security

- All settings endpoints require authentication
- Admin endpoints require `role:admin` middleware
- Input validation prevents invalid values
- XSS protection on all text inputs

---

## Future Enhancements

Potential improvements for future versions:

1. **Setting History** - Track who changed what and when
2. **Setting Groups** - Bulk enable/disable related settings
3. **Setting Presets** - Save/load common configurations
4. **Setting Import/Export** - Transfer settings between environments
5. **Setting Validation Rules** - Custom validation per setting
6. **Setting Dependencies** - Enforce relationships between settings
7. **Dynamic Frontend Validation** - Update validation schemas from API
8. **Setting Notifications** - Alert users when critical settings change

---

## Support

For questions or issues:

- Review the code comments in `SettingsService.php`
- Check API response structures in `SystemSettingsController.php`
- Examine UI implementation in `SettingsList.screen.tsx`
- Contact the development team

---

**Document Version:** 1.0  
**Last Updated:** January 31, 2026  
**System Version:** GPMS v1.0
