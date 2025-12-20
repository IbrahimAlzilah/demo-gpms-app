import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../layouts/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { useProposals } from '../../features/student/hooks/useProposals'
import { useRequests } from '../../features/student/hooks/useRequests'
import { useProjects } from '../../features/student/hooks/useProjects'
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
              <CardTitle>إجراءات سريعة</CardTitle>
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
              <CardTitle>المشروع الحالي</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.projects.registered > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    أنت مسجل في مشروع. تابع التقدم من صفحة متابعة المشروع.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={ROUTES.STUDENT.FOLLOW_UP}>
                      متابعة المشروع
                      <ArrowLeft className="me-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    لم يتم تسجيلك في أي مشروع بعد.
                  </p>
                  <Button asChild variant="default" className="w-full">
                    <Link to={ROUTES.STUDENT.PROJECTS}>
                      تصفح المشاريع المتاحة
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
                <CardTitle>المقترحات الأخيرة</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link to={ROUTES.STUDENT.PROPOSALS}>عرض الكل</Link>
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
                  لا توجد مقترحات
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Requests */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>الطلبات الأخيرة</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link to={ROUTES.STUDENT.REQUESTS}>عرض الكل</Link>
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
                          {request.type === 'change_supervisor' && 'تغيير المشرف'}
                          {request.type === 'change_group' && 'تغيير المجموعة'}
                          {request.type === 'change_project' && 'تغيير المشروع'}
                          {request.type === 'other' && 'طلب آخر'}
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
                  لا توجد طلبات
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
