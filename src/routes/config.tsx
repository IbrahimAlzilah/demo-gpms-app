import { ROUTES } from '@/lib/constants'
import type { RouteConfig } from './types'
import {
  // Public
  LazyLoginPage,
  LazyPasswordRecoveryPage,
  LazyUnauthorizedPage,
  LazyNotFoundPage,
  // Student
  LazyStudentDashboardPage,
  LazyStudentProposalsPage,
  LazyStudentProjectsPage,
  LazyGroupsPage,
  LazyRequestsPage,
  LazyDocumentsPage,
  LazyFollowUpPage,
  LazyGradesPage,
  // Supervisor
  LazySupervisorDashboardPage,
  LazySupervisionRequestsPage,
  LazySupervisorProjectsPage,
  LazyProgressPage,
  LazyEvaluationPage,
  // Discussion Committee
  LazyDiscussionCommitteeDashboardPage,
  LazyDiscussionProjectsPage,
  LazyDiscussionEvaluationPage,
  // Projects Committee
  LazyProjectsCommitteeDashboardPage,
  LazyPeriodsPage,
  LazyCommitteeProposalsPage,
  LazyAnnounceProjectsPage,
  LazySupervisorsPage,
  LazyCommitteeRequestsPage,
  LazyDistributeCommitteesPage,
  LazyCommitteeReportsPage,
  // Admin
  LazyAdminDashboardPage,
  LazyUsersPage,
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
    path: 'proposals',
    element: LazyStudentProposalsPage,
  },
  {
    path: 'projects',
    element: LazyStudentProjectsPage,
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
    path: 'supervision-requests',
    element: LazySupervisionRequestsPage,
  },
  {
    path: 'projects',
    element: LazySupervisorProjectsPage,
  },
  {
    path: 'progress',
    element: LazyProgressPage,
  },
  {
    path: 'evaluation',
    element: LazyEvaluationPage,
  },
]

// Discussion Committee routes
export const discussionCommitteeRoutes: RouteConfig[] = [
  {
    path: 'dashboard',
    element: LazyDiscussionCommitteeDashboardPage,
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

