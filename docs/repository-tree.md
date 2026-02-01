# شجرة المستودع الكاملة

## البنية الكاملة للمشروع

```
demo-gpms-app/
│
├── .agent/
│   └── workflows/
│       └── evaluation-defense-workflow.md
│
├── backend/
│   ├── app/
│   │   ├── Console/
│   │   │   └── Commands/
│   │   │       ├── ActivateTimePeriods.php
│   │   │       └── SendDeadlineReminders.php
│   │   │
│   │   ├── Enums/
│   │   │   ├── ProjectStatus.php
│   │   │   ├── ProposalStatus.php
│   │   │   ├── RequestStatus.php
│   │   │   └── TimePeriodType.php
│   │   │
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Admin/
│   │   │   │   │   ├── DashboardController.php
│   │   │   │   │   ├── ReportController.php
│   │   │   │   │   ├── ReportExportController.php
│   │   │   │   │   ├── SystemSettingsController.php
│   │   │   │   │   └── UserController.php
│   │   │   │   │
│   │   │   │   ├── DiscussionCommittee/
│   │   │   │   │   ├── DashboardController.php
│   │   │   │   │   ├── DocumentController.php
│   │   │   │   │   ├── EvaluationController.php
│   │   │   │   │   └── ProjectController.php
│   │   │   │   │
│   │   │   │   ├── ProjectsCommittee/
│   │   │   │   │   ├── CommitteeController.php
│   │   │   │   │   ├── DashboardController.php
│   │   │   │   │   ├── GradeController.php
│   │   │   │   │   ├── PeriodController.php
│   │   │   │   │   ├── ProjectController.php
│   │   │   │   │   ├── ProposalController.php
│   │   │   │   │   ├── RegistrationController.php
│   │   │   │   │   ├── ReportController.php
│   │   │   │   │   ├── ReportExportController.php
│   │   │   │   │   ├── RequestController.php
│   │   │   │   │   └── SupervisorController.php
│   │   │   │   │
│   │   │   │   ├── Student/
│   │   │   │   │   ├── DashboardController.php
│   │   │   │   │   ├── DocumentController.php
│   │   │   │   │   ├── GradeController.php
│   │   │   │   │   ├── ProjectController.php
│   │   │   │   │   ├── ProposalController.php
│   │   │   │   │   ├── RequestController.php
│   │   │   │   │   ├── StudentGroupController.php
│   │   │   │   │   └── SupervisorController.php
│   │   │   │   │
│   │   │   │   ├── Supervisor/
│   │   │   │   │   ├── DashboardController.php
│   │   │   │   │   ├── DocumentController.php
│   │   │   │   │   ├── EvaluationController.php
│   │   │   │   │   ├── MeetingController.php
│   │   │   │   │   ├── MilestoneController.php
│   │   │   │   │   ├── NoteController.php
│   │   │   │   │   ├── ProjectController.php
│   │   │   │   │   ├── ProposalController.php
│   │   │   │   │   ├── SupervisionController.php
│   │   │   │   │   └── SupervisorController.php
│   │   │   │   │
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── Controller.php
│   │   │   │   ├── NotificationController.php
│   │   │   │   ├── SettingsController.php
│   │   │   │   └── TimeWindowController.php
│   │   │   │
│   │   │   ├── Middleware/
│   │   │   │   ├── CheckTimeWindow.php
│   │   │   │   └── RoleMiddleware.php
│   │   │   │
│   │   │   ├── Requests/
│   │   │   │   └── ReportFiltersRequest.php
│   │   │   │
│   │   │   ├── Resources/
│   │   │   │   ├── DocumentResource.php
│   │   │   │   ├── GradeResource.php
│   │   │   │   ├── GroupRegistrationRequestResource.php
│   │   │   │   ├── NoteReplyResource.php
│   │   │   │   ├── NotificationResource.php
│   │   │   │   ├── ProjectMeetingResource.php
│   │   │   │   ├── ProjectMilestoneResource.php
│   │   │   │   ├── ProjectRegistrationResource.php
│   │   │   │   ├── ProjectResource.php
│   │   │   │   ├── ProposalResource.php
│   │   │   │   ├── ProposalSubmissionResource.php
│   │   │   │   ├── RequestResource.php
│   │   │   │   ├── StudentGroupResource.php
│   │   │   │   ├── SupervisorAssignmentRequestResource.php
│   │   │   │   ├── SupervisorNoteResource.php
│   │   │   │   ├── TimePeriodResource.php
│   │   │   │   └── UserResource.php
│   │   │   │
│   │   │   └── Traits/
│   │   │       └── HasTableQuery.php
│   │   │
│   │   ├── Models/
│   │   │   ├── CommitteeAssignment.php
│   │   │   ├── DiscussionCommittee.php
│   │   │   ├── Document.php
│   │   │   ├── Grade.php
│   │   │   ├── GroupRegistrationRequest.php
│   │   │   ├── NoteReply.php
│   │   │   ├── Notification.php
│   │   │   ├── Project.php
│   │   │   ├── ProjectCommittee.php
│   │   │   ├── ProjectMeeting.php
│   │   │   ├── ProjectMilestone.php
│   │   │   ├── ProjectRegistration.php
│   │   │   ├── ProjectRequest.php
│   │   │   ├── Proposal.php
│   │   │   ├── Setting.php
│   │   │   ├── Student.php
│   │   │   ├── StudentGroup.php
│   │   │   ├── StudentGroupInvitation.php
│   │   │   ├── StudentGroupJoinRequest.php
│   │   │   ├── Supervisor.php
│   │   │   ├── SupervisorAssignmentRequest.php
│   │   │   ├── SupervisorNote.php
│   │   │   ├── TimePeriod.php
│   │   │   └── User.php
│   │   │
│   │   ├── Policies/
│   │   │   ├── DocumentPolicy.php
│   │   │   ├── GradePolicy.php
│   │   │   ├── GroupRegistrationRequestPolicy.php
│   │   │   ├── ProjectPolicy.php
│   │   │   ├── ProjectRegistrationPolicy.php
│   │   │   ├── ProjectRequestPolicy.php
│   │   │   ├── ProposalPolicy.php
│   │   │   └── SupervisorAssignmentRequestPolicy.php
│   │   │
│   │   ├── Providers/
│   │   │   └── AppServiceProvider.php
│   │   │
│   │   └── Services/
│   │       ├── Dashboards/
│   │       │   ├── AdminDashboardService.php
│   │       │   ├── DiscussionCommitteeDashboardService.php
│   │       │   ├── ProjectsCommitteeDashboardService.php
│   │       │   ├── StudentDashboardService.php
│   │       │   └── SupervisorDashboardService.php
│   │       │
│   │       ├── DocumentService.php
│   │       ├── EvaluationService.php
│   │       ├── NotificationService.php
│   │       ├── ProjectService.php
│   │       ├── ProposalService.php
│   │       ├── ReportService.php
│   │       ├── RequestService.php
│   │       ├── SettingsService.php
│   │       ├── StudentGroupService.php
│   │       └── TimeWindowService.php
│   │
│   ├── bootstrap/
│   │   ├── app.php
│   │   ├── providers.php
│   │   └── cache/
│   │
│   ├── config/
│   │   ├── app.php
│   │   ├── auth.php
│   │   ├── cache.php
│   │   ├── cors.php
│   │   ├── database.php
│   │   ├── filesystems.php
│   │   ├── logging.php
│   │   ├── mail.php
│   │   ├── queue.php
│   │   ├── sanctum.php
│   │   ├── services.php
│   │   └── session.php
│   │
│   ├── database/
│   │   ├── factories/
│   │   │   ├── ProposalFactory.php
│   │   │   ├── StudentFactory.php
│   │   │   ├── SupervisorFactory.php
│   │   │   └── UserFactory.php
│   │   │
│   │   ├── migrations/ (48 ملف migration)
│   │   │
│   │   └── seeders/
│   │       ├── helpers/
│   │       │   └── YemeniDataHelper.php
│   │       ├── CommitteesSeeder.php
│   │       ├── DatabaseSeeder.php
│   │       ├── ProjectCommitteeWorkflowSeeder.php
│   │       ├── ProposalsSeeder.php
│   │       ├── SettingsSeeder.php
│   │       ├── TimePeriodsSeeder.php
│   │       └── UsersSeeder.php
│   │
│   ├── public/
│   │   ├── .htaccess
│   │   ├── favicon.ico
│   │   ├── index.php
│   │   └── robots.txt
│   │
│   ├── resources/
│   │   ├── css/
│   │   │   └── app.css
│   │   ├── js/
│   │   │   ├── app.js
│   │   │   └── bootstrap.js
│   │   └── views/
│   │       └── welcome.blade.php
│   │
│   ├── routes/
│   │   ├── api.php
│   │   ├── console.php
│   │   └── web.php
│   │
│   ├── storage/
│   │   ├── app/
│   │   ├── framework/
│   │   └── logs/
│   │
│   ├── tests/
│   │   ├── Feature/
│   │   └── Unit/
│   │
│   ├── .editorconfig
│   ├── .env.example
│   ├── .gitattributes
│   ├── .gitignore
│   ├── artisan
│   ├── composer.json
│   ├── composer.lock
│   ├── DATABASE_SCHEMA.md
│   ├── package.json
│   ├── phpunit.xml
│   ├── README.md
│   └── vite.config.js
│
├── frontend/
│   ├── public/
│   │   └── vite.svg
│   │
│   ├── src/
│   │   ├── assets/
│   │   │   ├── fonts/ (خطوط Expo Arabic)
│   │   │   ├── icons/
│   │   │   ├── images/
│   │   │   └── logo.png, logo2.png
│   │   │
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── ActionsDropdown.tsx
│   │   │   │   ├── BlockContent.tsx
│   │   │   │   ├── Breadcrumbs.tsx
│   │   │   │   ├── ConfirmDialog.tsx
│   │   │   │   ├── DashboardHeader.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   ├── FileUpload.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   ├── ModalDialog.tsx
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   ├── RoleGuard.tsx
│   │   │   │   ├── StatsCard.tsx
│   │   │   │   ├── StatusBadge.tsx
│   │   │   │   ├── StatusFilter.tsx
│   │   │   │   └── toaster.tsx
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── AppSidebar.tsx
│   │   │   │   ├── DropdownMenu.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── languagt-toggle.tsx
│   │   │   │   ├── NotificationsPopover.tsx
│   │   │   │   └── theme-toggle.tsx
│   │   │   │
│   │   │   └── ui/ (مكونات Radix UI + Tailwind)
│   │   │       ├── alert.tsx
│   │   │       ├── badge.tsx
│   │   │       ├── button.tsx
│   │   │       ├── calendar.tsx
│   │   │       ├── card.tsx
│   │   │       ├── checkbox.tsx
│   │   │       ├── command.tsx
│   │   │       ├── data-table/
│   │   │       ├── DatePicker.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── dropdown-menu.tsx
│   │   │       ├── input.tsx
│   │   │       ├── label.tsx
│   │   │       ├── popover.tsx
│   │   │       ├── progress.tsx
│   │   │       ├── radio-group.tsx
│   │   │       ├── select.tsx
│   │   │       ├── separator.tsx
│   │   │       ├── sheet.tsx
│   │   │       ├── sidebar.tsx
│   │   │       ├── skeleton.tsx
│   │   │       ├── switch.tsx
│   │   │       ├── table.tsx
│   │   │       ├── tabs.tsx
│   │   │       ├── textarea.tsx
│   │   │       └── tooltip.tsx
│   │   │
│   │   ├── context/
│   │   │   ├── direction-provider.tsx
│   │   │   ├── i18n-provider.tsx
│   │   │   ├── query-provider.tsx
│   │   │   └── theme-provider.tsx
│   │   │
│   │   ├── features/
│   │   │   └── dashboard/ (api, components, types)
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-direction.ts
│   │   │   ├── use-mobile.ts
│   │   │   ├── use-notifications.ts
│   │   │   ├── useDataTable.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   └── usePeriodCheck.ts
│   │   │
│   │   ├── layouts/
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── MainLayout.tsx
│   │   │
│   │   ├── lib/
│   │   │   ├── i18n/
│   │   │   │   ├── locales/ (ar, en)
│   │   │   │   └── i18n.ts
│   │   │   ├── mock/
│   │   │   ├── table/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   ├── axios.ts
│   │   │   ├── constants.ts
│   │   │   └── utils.ts
│   │   │
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboardPage.tsx
│   │   │   │   ├── reports/
│   │   │   │   ├── settings/
│   │   │   │   └── users/
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── password-recovery/
│   │   │   │
│   │   │   ├── committee/
│   │   │   │   ├── discussion/
│   │   │   │   │   ├── evaluation/
│   │   │   │   │   └── projects/
│   │   │   │   │
│   │   │   │   └── projects/
│   │   │   │       ├── announce-projects/
│   │   │   │       ├── distribute-committees/
│   │   │   │       ├── grades/
│   │   │   │       ├── periods/
│   │   │   │       ├── projects/
│   │   │   │       ├── proposals/
│   │   │   │       ├── registrations/
│   │   │   │       ├── reports/
│   │   │   │       ├── requests/
│   │   │   │       └── supervisors/
│   │   │   │
│   │   │   ├── student/
│   │   │   │   ├── StudentDashboardPage.tsx
│   │   │   │   ├── documents/
│   │   │   │   ├── followUp/
│   │   │   │   ├── grades/
│   │   │   │   ├── groups/
│   │   │   │   ├── projects/
│   │   │   │   ├── proposals/
│   │   │   │   └── requests/
│   │   │   │
│   │   │   ├── supervisor/
│   │   │   │   ├── SupervisorDashboardPage.tsx
│   │   │   │   ├── evaluation/
│   │   │   │   ├── progress/
│   │   │   │   ├── projects/
│   │   │   │   ├── proposals/
│   │   │   │   └── supervision-requests/
│   │   │   │
│   │   │   ├── not-found/
│   │   │   └── unauthorized/
│   │   │
│   │   ├── routes/
│   │   │   ├── config.tsx
│   │   │   ├── guards.tsx
│   │   │   ├── index.tsx
│   │   │   ├── lazy.tsx
│   │   │   └── types.ts
│   │   │
│   │   ├── services/
│   │   │   ├── api.service.ts
│   │   │   └── notifications.service.ts
│   │   │
│   │   ├── stores/
│   │   │   ├── app.store.ts
│   │   │   └── theme.store.ts
│   │   │
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   └── globals2.css
│   │   │
│   │   ├── types/
│   │   │   ├── api.types.ts
│   │   │   ├── axios-extensions.d.ts
│   │   │   ├── common.types.ts
│   │   │   ├── evaluation.types.ts
│   │   │   ├── notification.types.ts
│   │   │   ├── period.types.ts
│   │   │   ├── project.types.ts
│   │   │   ├── request.types.ts
│   │   │   ├── settings.types.ts
│   │   │   ├── table.types.ts
│   │   │   └── user.types.ts
│   │   │
│   │   ├── utils/
│   │   │   └── notification-navigation.ts
│   │   │
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── .env.development
│   ├── .env.example
│   ├── .gitignore
│   ├── components.json
│   ├── DYNAMIC_SETTINGS_DOCUMENTATION.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
│
├── docs/
│   ├── README.md
│   ├── 00-overview.md
│   ├── 01-system-architecture.md
│   ├── 02-database.md
│   ├── 03-backend.md
│   ├── 04-frontend.md
│   ├── 05-running-the-project.md
│   ├── 06-improvements.md
│   ├── 07-api-reference.md
│   ├── 08-user-roles-permissions.md
│   └── repository-tree.md
│
└── README.md
```

## ملاحظات

- **Backend**: Laravel 12 + PHP 8.2 + MySQL + Sanctum
- **Frontend**: React 19 + TypeScript + Vite + TanStack Query + Tailwind CSS
- **قاعدة البيانات**: MySQL مع 48 migration و 7 seeders
- **التوثيق**: 7 ملفات توثيق شاملة بالعربية
