import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '../components/common/ProtectedRoute'
import { RoleGuard } from '../components/common/RoleGuard'
import { ROUTES } from '../lib/constants'

// Public pages
import { LoginPage } from '../pages/auth/LoginPage'
import { PasswordRecoveryPage } from '../pages/auth/ForgetPasswordPage'
import { UnauthorizedPage } from '../pages/unauthorized/UnauthorizedPage'
import { NotFoundPage } from '../pages/not-found/NotFoundPage'

// Student pages
import { StudentDashboardPage } from '../pages/student/StudentDashboardPage'
import { ProposalsPage as StudentProposalsPage } from '../pages/student/ProposalsPage'
import { ProjectsPage } from '../pages/student/ProjectsPage'
import { GroupsPage } from '../pages/student/GroupsPage'
import { RequestsPage } from '../pages/student/RequestsPage'
import { DocumentsPage } from '../pages/student/DocumentsPage'
import { FollowUpPage } from '../pages/student/FollowUpPage'
import { GradesPage } from '../pages/student/GradesPage'

// Supervisor pages
import { SupervisorDashboardPage } from '../pages/supervisor/SupervisorDashboardPage'
import { SupervisionRequestsPage } from '../pages/supervisor/SupervisionRequestsPage'
import { SupervisorProjectsPage } from '../pages/supervisor/ProjectsPage'
import { ProgressPage } from '../pages/supervisor/ProgressPage'
import { EvaluationPage } from '../pages/supervisor/EvaluationPage'

// Discussion Committee pages
import { DiscussionCommitteeDashboardPage } from '../pages/committee/discussion/DiscussionCommitteeDashboardPage'
import { DiscussionEvaluationPage } from '../pages/committee/discussion/EvaluationPage'
import { DiscussionProjectsPage } from '../pages/committee/discussion/ProjectsPage'

// Projects Committee pages
import { ProjectsCommitteeDashboardPage } from '../pages/committee/projects/ProjectsCommitteeDashboardPage'
import { PeriodsPage } from '../pages/committee/projects/PeriodsPage'
import { ProposalsPage as CommitteeProposalsPage } from '../pages/committee/projects/ProposalsPage'
import { AnnounceProjectsPage } from '../pages/committee/projects/AnnounceProjectsPage'
import { SupervisorsPage } from '../pages/committee/projects/SupervisorsPage'
import { CommitteeRequestsPage } from '../pages/committee/projects/RequestsPage'
import { DistributeCommitteesPage } from '../pages/committee/projects/DistributeCommitteesPage'
import { CommitteeReportsPage } from '../pages/committee/projects/ReportsPage'

// Admin pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { UsersPage } from '../pages/admin/UsersPage'
import { ReportsPage } from '../pages/admin/ReportsPage'

export function RootRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path="/recover-password" element={<PasswordRecoveryPage />} />
        <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />

        {/* Protected routes - Student */}
        <Route
          path="/student/*"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['student']}>
                <Routes>
                  <Route
                    path="dashboard"
                    element={<StudentDashboardPage />}
                  />
                  <Route
                    path="proposals"
                    element={<StudentProposalsPage />}
                  />
                  <Route
                    path="projects"
                    element={<ProjectsPage />}
                  />
                  <Route
                    path="groups"
                    element={<GroupsPage />}
                  />
                  <Route
                    path="requests"
                    element={<RequestsPage />}
                  />
                  <Route
                    path="documents"
                    element={<DocumentsPage />}
                  />
                  <Route
                    path="follow-up"
                    element={<FollowUpPage />}
                  />
                  <Route
                    path="grades"
                    element={<GradesPage />}
                  />
                  <Route
                    path="*"
                    element={<Navigate to={ROUTES.STUDENT.DASHBOARD} replace />}
                  />
                </Routes>
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        {/* Protected routes - Supervisor */}
        <Route
          path="/supervisor/*"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['supervisor']}>
                <Routes>
                  <Route
                    path="dashboard"
                    element={<SupervisorDashboardPage />}
                  />
                  <Route
                    path="supervision-requests"
                    element={<SupervisionRequestsPage />}
                  />
                  <Route
                    path="projects"
                    element={<SupervisorProjectsPage />}
                  />
                  <Route
                    path="progress"
                    element={<ProgressPage />}
                  />
                  <Route
                    path="evaluation"
                    element={<EvaluationPage />}
                  />
                  <Route
                    path="*"
                    element={
                      <Navigate to={ROUTES.SUPERVISOR.DASHBOARD} replace />
                    }
                  />
                </Routes>
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        {/* Protected routes - Discussion Committee */}
        <Route
          path="/committee/discussion/*"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['discussion_committee']}>
                <Routes>
                  <Route
                    path="dashboard"
                    element={<DiscussionCommitteeDashboardPage />}
                  />
                  <Route
                    path="projects"
                    element={<DiscussionProjectsPage />}
                  />
                  <Route
                    path="evaluation"
                    element={<DiscussionEvaluationPage />}
                  />
                  <Route
                    path="*"
                    element={
                      <Navigate
                        to={ROUTES.DISCUSSION_COMMITTEE.DASHBOARD}
                        replace
                      />
                    }
                  />
                </Routes>
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        {/* Protected routes - Projects Committee */}
        <Route
          path="/committee/projects/*"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['projects_committee']}>
                <Routes>
                  <Route
                    path="dashboard"
                    element={<ProjectsCommitteeDashboardPage />}
                  />
                  <Route
                    path="periods"
                    element={<PeriodsPage />}
                  />
                  <Route
                    path="proposals"
                    element={<CommitteeProposalsPage />}
                  />
                  <Route
                    path="announce"
                    element={<AnnounceProjectsPage />}
                  />
                  <Route
                    path="supervisors"
                    element={<SupervisorsPage />}
                  />
                  <Route
                    path="requests"
                    element={<CommitteeRequestsPage />}
                  />
                  <Route
                    path="distribute"
                    element={<DistributeCommitteesPage />}
                  />
                  <Route
                    path="reports"
                    element={<CommitteeReportsPage />}
                  />
                  <Route
                    path="*"
                    element={
                      <Navigate
                        to={ROUTES.PROJECTS_COMMITTEE.DASHBOARD}
                        replace
                      />
                    }
                  />
                </Routes>
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        {/* Protected routes - Admin */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['admin']}>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route
                    path="*"
                    element={<Navigate to={ROUTES.ADMIN.DASHBOARD} replace />}
                  />
                </Routes>
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        {/* Default redirect for authenticated users */}
        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </BrowserRouter>
  )
}

