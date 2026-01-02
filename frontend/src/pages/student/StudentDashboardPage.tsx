import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../layouts/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { useProposals } from './proposals'
import { useRequests } from './requests'
import { useProjects } from './projects'
import { useAuthStore } from '../../features/auth/store/auth.store'
import { ROUTES } from '../../lib/constants'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import {
  FileText,
  Briefcase,
  FileCheck,
  Award,
  ArrowLeft,
} from 'lucide-react'
import { StatusBadge } from '../../components/common/StatusBadge'
import { formatRelativeTime } from '../../lib/utils/format'

export function StudentDashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { data: proposals, isLoading: proposalsLoading } = useProposals()
  const { data: requests, isLoading: requestsLoading } = useRequests()
  const { data: projects, isLoading: projectsLoading } = useProjects()

  const isLoading = proposalsLoading || requestsLoading || projectsLoading

  // Calculate statistics
  const stats = {
    proposals: {
      total: proposals?.length || 0,
      pending: proposals?.filter((p) => p.status === 'pending_review').length || 0,
      approved: proposals?.filter((p) => p.status === 'approved').length || 0,
    },
    requests: {
      total: requests?.length || 0,
      pending: requests?.filter((r) => r.status === 'pending').length || 0,
      approved: requests?.filter((r) => r.status === 'committee_approved').length || 0,
    },
    projects: {
      registered: projects?.filter((p) => p.students.some((s) => s.id === user?.id)).length || 0,
      available: projects?.filter((p) => p.status === 'available_for_registration').length || 0,
    },
  }

  // Get recent proposals
  const recentProposals = proposals
    ?.filter((p) => p.submitterId === user?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  // Get recent requests
  const recentRequests = requests
    ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.student.proposals')}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.proposals.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.proposals.pending} {t('dashboard.student.pendingReview')} • {stats.proposals.approved} {t('dashboard.student.approved')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.student.projects')}</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.projects.registered}</div>
              <p className="text-xs text-muted-foreground">
                {stats.projects.available} {t('dashboard.student.availableForRegistration')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.student.requests')}</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.requests.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.requests.pending} {t('dashboard.student.pending')} • {stats.requests.approved} {t('dashboard.student.approvedBy')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.student.grades')}</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">{t('dashboard.student.notEvaluated')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.student.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={ROUTES.STUDENT.PROPOSALS}>
                  <FileText className="ms-2 h-4 w-4" />
                  {t('dashboard.student.submitNewProposal')}
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={ROUTES.STUDENT.PROJECTS}>
                  <Briefcase className="ms-2 h-4 w-4" />
                  {t('dashboard.student.browseAvailableProjects')}
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={ROUTES.STUDENT.REQUESTS}>
                  <FileCheck className="ms-2 h-4 w-4" />
                  {t('dashboard.student.submitNewRequest')}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.student.currentProject')}</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.projects.registered > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.student.registeredInProject')}
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={ROUTES.STUDENT.FOLLOW_UP}>
                      {t('dashboard.student.followProject')}
                      <ArrowLeft className="me-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.student.notRegisteredInProject')}
                  </p>
                  <Button asChild variant="default" className="w-full">
                    <Link to={ROUTES.STUDENT.PROJECTS}>
                      {t('dashboard.student.browseAvailableProjects')}
                      <ArrowLeft className="me-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Proposals */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('dashboard.student.recentProposals')}</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link to={ROUTES.STUDENT.PROPOSALS}>{t('common.viewAll')}</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentProposals && recentProposals.length > 0 ? (
                <div className="space-y-3">
                  {recentProposals.map((proposal) => (
                    <div
                      key={proposal.id}
                      className="flex items-start justify-between rounded-lg border p-3"
                    >
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{proposal.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(proposal.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={proposal.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t('dashboard.student.noProposals')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Requests */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t('dashboard.student.recentRequests')}</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link to={ROUTES.STUDENT.REQUESTS}>{t('common.viewAll')}</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentRequests && recentRequests.length > 0 ? (
                <div className="space-y-3">
                  {recentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-start justify-between rounded-lg border p-3"
                    >
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">
                          {request.type === 'change_supervisor' && t('request.changeSupervisor')}
                          {request.type === 'change_group' && t('request.changeGroup')}
                          {request.type === 'change_project' && t('request.changeProject')}
                          {request.type === 'other' && t('request.other')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(request.createdAt)}
                        </p>
                      </div>
                      <StatusBadge status={request.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t('request.noRequests')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
