import { ROUTES } from '@/lib/constants'
import type { RouteConfig } from './types'
import {
  // Public
  LazyLoginPage,
  LazyPasswordRecoveryPage,
  LazyUnauthorizedPage,
  // Student
  LazyStudentDashboardPage,
  LazyStudentProposalsPage,
  LazyStudentProposalsSubmitPage,
  LazyStudentProposalsEditPage,
  LazyStudentProposalsViewPage,
  LazyStudentProjectsPage,
  LazyStudentProjectRegisterPage,
  LazyGroupsPage,
  LazyRequestsPage,
  LazyDocumentsPage,
  LazyFollowUpPage,
  LazyGradesPage,
  // Supervisor
  LazySupervisorDashboardPage,
  LazySupervisorProposalsPage,
  LazySupervisorProposalsSubmitPage,
  LazySupervisorProposalsEditPage,
  LazySupervisorProposalsViewPage,
  LazySupervisionRequestsPage,
  LazySupervisorProjectsPage,
  LazySupervisorProjectDetailsPage,
  LazySupervisorEvaluationPage,
  // Discussion Committee
  LazyDiscussionCommitteeDashboardPage,
  LazyDiscussionProjectsPage,
  LazyDiscussionProjectDetailPage,
  LazyDiscussionEvaluationPage,
  // Projects Committee
  LazyProjectsCommitteeDashboardPage,
  LazyPeriodsPage,
  LazyCommitteeProposalsPage,
  LazyProjectsPage,
  LazyProjectManagementPage,
  LazyAnnounceProjectsPage,
  LazySupervisorsPage,
  LazyCommitteeRequestsPage,
  LazyRegistrationsPage,
  LazyCommitteeGradesPage,
  LazyDistributeCommitteesPage,
  LazyCommitteeReportsPage,
  // Admin
  LazyAdminDashboardPage,
  LazyUsersPage,
  LazySettingsPage,
  LazyReportsPage,
} from './lazy'

// Public routes
export const publicRoutes: RouteConfig[] = [
  {
    path: ROUTES.LOGIN,
    element: LazyLoginPage,
  },
  {
    path: '/recover-password',
    element: LazyPasswordRecoveryPage,
  },
  {
    path: ROUTES.UNAUTHORIZED,
    element: LazyUnauthorizedPage,
  },
]

// Student routes
export const studentRoutes: RouteConfig[] = [
  {
    path: 'dashboard',
    element: LazyStudentDashboardPage,
  },
  {
    path: 'my-proposals',
    element: LazyStudentProposalsPage,
  },
  {
    path: 'approved-proposals',
    element: LazyStudentProposalsPage,
  },
  {
    path: 'proposals/submit',
    element: LazyStudentProposalsSubmitPage,
  },
  {
    path: 'proposals/edit',
    element: LazyStudentProposalsEditPage,
  },
  {
    path: 'proposals/:id',
    element: LazyStudentProposalsViewPage,
  },
  {
    path: 'proposals',
    element: LazyStudentProposalsPage,
  },
  {
    path: 'projects',
    element: LazyStudentProjectsPage,
  },
  {
    path: 'projects/register/:projectId',
    element: LazyStudentProjectRegisterPage,
  },
  {
    path: 'groups',
    element: LazyGroupsPage,
  },
  {
    path: 'requests',
    element: LazyRequestsPage,
  },
  {
    path: 'documents',
    element: LazyDocumentsPage,
  },
  {
    path: 'follow-up',
    element: LazyFollowUpPage,
  },
  {
    path: 'grades',
    element: LazyGradesPage,
  },
]

// Supervisor routes
export const supervisorRoutes: RouteConfig[] = [
  {
    path: 'dashboard',
    element: LazySupervisorDashboardPage,
  },
  {
    path: 'my-proposals',
    element: LazySupervisorProposalsPage,
  },
  {
    path: 'approved-proposals',
    element: LazySupervisorProposalsPage,
  },
  {
    path: 'proposals/submit',
    element: LazySupervisorProposalsSubmitPage,
  },
  {
    path: 'proposals/edit',
    element: LazySupervisorProposalsEditPage,
  },
  {
    path: 'proposals/:id',
    element: LazySupervisorProposalsViewPage,
  },
  {
    path: 'proposals',
    element: LazySupervisorProposalsPage,
  },
  {
    path: 'supervision-requests',
    element: LazySupervisionRequestsPage,
  },
  {
    path: 'projects/:id',
    element: LazySupervisorProjectDetailsPage,
  },
  {
    path: 'projects',
    element: LazySupervisorProjectsPage,
  },
  {
    path: 'evaluation/:projectId',
    element: LazySupervisorEvaluationPage,
  },
  {
    path: 'evaluation',
    element: LazySupervisorEvaluationPage,
  },
]

// Discussion Committee routes
export const discussionCommitteeRoutes: RouteConfig[] = [
  {
    path: 'dashboard',
    element: LazyDiscussionCommitteeDashboardPage,
  },
  {
    path: 'projects/:projectId',
    element: LazyDiscussionProjectDetailPage,
  },
  {
    path: 'projects',
    element: LazyDiscussionProjectsPage,
  },
  {
    path: 'evaluation',
    element: LazyDiscussionEvaluationPage,
  },
]

// Projects Committee routes
export const projectsCommitteeRoutes: RouteConfig[] = [
  {
    path: 'dashboard',
    element: LazyProjectsCommitteeDashboardPage,
  },
  {
    path: 'periods',
    element: LazyPeriodsPage,
  },
  {
    path: 'proposals',
    element: LazyCommitteeProposalsPage,
  },
  {
    path: 'projects/:projectId',
    element: LazyProjectManagementPage,
  },
  {
    path: 'projects',
    element: LazyProjectsPage,
  },
  {
    path: 'announce',
    element: LazyAnnounceProjectsPage,
  },
  {
    path: 'supervisors',
    element: LazySupervisorsPage,
  },
  {
    path: 'requests',
    element: LazyCommitteeRequestsPage,
  },
  {
    path: 'registrations',
    element: LazyRegistrationsPage,
  },
  {
    path: 'grades',
    element: LazyCommitteeGradesPage,
  },
  {
    path: 'distribute',
    element: LazyDistributeCommitteesPage,
  },
  {
    path: 'reports',
    element: LazyCommitteeReportsPage,
  },
]

// Admin routes
export const adminRoutes: RouteConfig[] = [
  {
    path: 'dashboard',
    element: LazyAdminDashboardPage,
  },
  {
    path: 'users',
    element: LazyUsersPage,
  },
  {
    path: 'settings',
    element: LazySettingsPage,
  },
  {
    path: 'reports',
    element: LazyReportsPage,
  },
]

// Route mappings for role-based routing
export const roleRouteMap = {
  student: {
    routes: studentRoutes,
    defaultPath: ROUTES.STUDENT.DASHBOARD,
  },
  supervisor: {
    routes: supervisorRoutes,
    defaultPath: ROUTES.SUPERVISOR.DASHBOARD,
  },
  discussion_committee: {
    routes: discussionCommitteeRoutes,
    defaultPath: ROUTES.DISCUSSION_COMMITTEE.DASHBOARD,
  },
  projects_committee: {
    routes: projectsCommitteeRoutes,
    defaultPath: ROUTES.PROJECTS_COMMITTEE.DASHBOARD,
  },
  admin: {
    routes: adminRoutes,
    defaultPath: ROUTES.ADMIN.DASHBOARD,
  },
} as const

