import { lazy } from 'react'

// Public pages
export const LazyLoginPage = lazy(() => import('../pages/auth/LoginPage').then(m => ({ default: m.LoginPage })))
export const LazyPasswordRecoveryPage = lazy(() => import('../pages/auth/ForgetPasswordPage').then(m => ({ default: m.PasswordRecoveryPage })))
export const LazyUnauthorizedPage = lazy(() => import('../pages/unauthorized/UnauthorizedPage').then(m => ({ default: m.UnauthorizedPage })))
export const LazyNotFoundPage = lazy(() => import('../pages/not-found/NotFoundPage').then(m => ({ default: m.NotFoundPage })))

// Student pages
export const LazyStudentDashboardPage = lazy(() => import('../pages/student/StudentDashboardPage').then(m => ({ default: m.StudentDashboardPage })))
export const LazyStudentProposalsPage = lazy(() => import('../pages/student/proposals/ProposalsPage').then(m => ({ default: m.ProposalsPage })))
export const LazyStudentProjectsPage = lazy(() => import('../pages/student/projects/ProjectsPage').then(m => ({ default: m.ProjectsPage })))
export const LazyGroupsPage = lazy(() => import('../pages/student/groups/GroupsPage').then(m => ({ default: m.GroupsPage })))
export const LazyRequestsPage = lazy(() => import('../pages/student/requests/RequestsPage').then(m => ({ default: m.RequestsPage })))
export const LazyDocumentsPage = lazy(() => import('../pages/student/documents/DocumentsPage').then(m => ({ default: m.DocumentsPage })))
export const LazyFollowUpPage = lazy(() => import('../pages/student/followUp/FollowUpPage').then(m => ({ default: m.FollowUpPage })))
export const LazyGradesPage = lazy(() => import('../pages/student/grades/GradesPage').then(m => ({ default: m.GradesPage })))

// Supervisor pages
export const LazySupervisorDashboardPage = lazy(() => import('../pages/supervisor/SupervisorDashboardPage').then(m => ({ default: m.SupervisorDashboardPage })))
export const LazySupervisorProposalsPage = lazy(() => import('../pages/supervisor/ProposalsPage').then(m => ({ default: m.SupervisorProposalsPage })))
export const LazySupervisionRequestsPage = lazy(() => import('../pages/supervisor/SupervisionRequestsPage').then(m => ({ default: m.SupervisionRequestsPage })))
export const LazySupervisorProjectsPage = lazy(() => import('../pages/supervisor/ProjectsPage').then(m => ({ default: m.SupervisorProjectsPage })))
export const LazyProgressPage = lazy(() => import('../pages/supervisor/ProgressPage').then(m => ({ default: m.ProgressPage })))
export const LazyEvaluationPage = lazy(() => import('../pages/supervisor/EvaluationPage').then(m => ({ default: m.EvaluationPage })))

// Discussion Committee pages
export const LazyDiscussionCommitteeDashboardPage = lazy(() => import('../pages/committee/discussion/DiscussionCommitteeDashboardPage').then(m => ({ default: m.DiscussionCommitteeDashboardPage })))
export const LazyDiscussionEvaluationPage = lazy(() => import('../pages/committee/discussion/EvaluationPage').then(m => ({ default: m.DiscussionEvaluationPage })))
export const LazyDiscussionProjectsPage = lazy(() => import('../pages/committee/discussion/ProjectsPage').then(m => ({ default: m.DiscussionProjectsPage })))

// Projects Committee pages
export const LazyProjectsCommitteeDashboardPage = lazy(() => import('../pages/committee/projects/ProjectsCommitteeDashboardPage').then(m => ({ default: m.ProjectsCommitteeDashboardPage })))
export const LazyPeriodsPage = lazy(() => import('../pages/committee/projects/PeriodsPage').then(m => ({ default: m.PeriodsPage })))
export const LazyCommitteeProposalsPage = lazy(() => import('../pages/committee/projects/ProposalsPage').then(m => ({ default: m.ProposalsPage })))
export const LazyAnnounceProjectsPage = lazy(() => import('../pages/committee/projects/AnnounceProjectsPage').then(m => ({ default: m.AnnounceProjectsPage })))
export const LazySupervisorsPage = lazy(() => import('../pages/committee/projects/SupervisorsPage').then(m => ({ default: m.SupervisorsPage })))
export const LazyCommitteeRequestsPage = lazy(() => import('../pages/committee/projects/RequestsPage').then(m => ({ default: m.CommitteeRequestsPage })))
export const LazyRegistrationsPage = lazy(() => import('../pages/committee/projects/RegistrationsPage').then(m => ({ default: m.RegistrationsPage })))
export const LazyDistributeCommitteesPage = lazy(() => import('../pages/committee/projects/DistributeCommitteesPage').then(m => ({ default: m.DistributeCommitteesPage })))
export const LazyCommitteeReportsPage = lazy(() => import('../pages/committee/projects/ReportsPage').then(m => ({ default: m.CommitteeReportsPage })))

// Admin pages
export const LazyAdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })))
export const LazyUsersPage = lazy(() => import('../pages/admin/UsersPage').then(m => ({ default: m.UsersPage })))
export const LazyReportsPage = lazy(() => import('../pages/admin/ReportsPage').then(m => ({ default: m.ReportsPage })))

