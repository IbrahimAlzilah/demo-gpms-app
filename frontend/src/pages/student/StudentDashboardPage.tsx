import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../layouts/MainLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { useProposals } from './proposals'
import { useRequests } from './requests'
import { useProjects } from './projects'
import { useAuthStore } from '../../pages/auth/login'
import { ROUTES } from '../../lib/constants'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import {
  FileText,
  Briefcase,
  FileCheck,
  Award,
  ArrowLeft,
  ArrowRight,
  Plus,
  Search,
  Activity
} from 'lucide-react'
import { StatusBadge } from '../../components/common/StatusBadge'
import { formatRelativeTime } from '../../lib/utils/format'
import { cn } from '../../lib/utils'

export function StudentDashboardPage() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
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
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner />
        </div>
      </MainLayout>
    )
  }

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  return (
    <MainLayout>
      <div className="space-y-8 animate-in fade-in duration-700 pb-10">
        {/* Stats Grid - Modern & Spacious */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title={t('dashboard.student.proposals')}
            value={stats.proposals.total}
            icon={FileText}
            description={`${stats.proposals.pending} ${t('dashboard.student.pendingReview')}`}
            trend="neutral"
            color="blue"
          />
          <StatsCard
            title={t('dashboard.student.projects')}
            value={stats.projects.registered}
            icon={Briefcase}
            description={`${stats.projects.available} ${t('dashboard.student.availableForRegistration')}`}
            trend="positive"
            color="green"
          />
          <StatsCard
            title={t('dashboard.student.requests')}
            value={stats.requests.total}
            icon={FileCheck}
            description={`${stats.requests.pending} ${t('dashboard.student.pending')}`}
            trend="warning"
            color="orange"
          />
          <StatsCard
            title={t('dashboard.student.grades')}
            value="-"
            icon={Award}
            description={t('dashboard.student.notEvaluated')}
            trend="neutral"
            color="purple"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Area (2/3) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Recent Proposals Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">{t('dashboard.student.recentProposals')}</h2>
                <Button variant="ghost" className="text-primary hover:text-primary/80" asChild>
                  <Link to={ROUTES.STUDENT.PROPOSALS}>
                    {t('common.viewAll')} <ArrowIcon className="ms-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-4">
                {recentProposals && recentProposals.length > 0 ? (
                  recentProposals.map((proposal) => (
                    <Card key={proposal.id} className="group hover:border-primary/50 transition-colors duration-300">
                      <CardContent className="p-5 flex items-start justify-between">
                        <div className="space-y-1.5">
                          <h3 className="font-semibold group-hover:text-primary transition-colors">{proposal.title}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Activity className="h-3.5 w-3.5" />
                            {formatRelativeTime(proposal.createdAt)}
                          </p>
                        </div>
                        <StatusBadge status={proposal.status} />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <EmptyState
                    icon={FileText}
                    message={t('dashboard.student.noProposals')}
                    actionLabel={t('dashboard.student.submitNewProposal')}
                    actionLink={ROUTES.STUDENT.PROPOSALS}
                  />
                )}
              </div>
            </div>

            {/* Recent Requests Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">{t('dashboard.student.recentRequests')}</h2>
                <Button variant="ghost" className="text-primary hover:text-primary/80" asChild>
                  <Link to={ROUTES.STUDENT.REQUESTS}>
                    {t('common.viewAll')} <ArrowIcon className="ms-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-4">
                {recentRequests && recentRequests.length > 0 ? (
                  recentRequests.map((request) => (
                    <Card key={request.id} className="group hover:border-primary/50 transition-colors duration-300">
                      <CardContent className="p-5 flex items-start justify-between">
                        <div className="space-y-1.5">
                          <h3 className="font-semibold group-hover:text-primary transition-colors">
                            {request.type === 'change_supervisor' && t('requests.change_supervisor')}
                            {request.type === 'change_group' && t('requests.change_group')}
                            {request.type === 'change_project' && t('requests.change_project')}
                            {request.type === 'other' && t('requests.other')}
                          </h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Activity className="h-3.5 w-3.5" />
                            {formatRelativeTime(request.createdAt)}
                          </p>
                        </div>
                        <StatusBadge status={request.status} />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <EmptyState
                    icon={FileCheck}
                    message={t('request.noRequests')}
                    actionLabel={t('dashboard.student.submitNewRequest')}
                    actionLink={ROUTES.STUDENT.REQUESTS}
                  />
                )}
              </div>
            </div>

          </div>

          {/* Sidebar Area (1/3) */}
          <div className="space-y-8">

            {/* Current Project Status */}
            <Card className="overflow-hidden border-primary/20 bg-primary/5">
              <CardHeader className="border-b border-primary/10 bg-primary/10 pb-4">
                <CardTitle className="text-primary flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  {t('dashboard.student.currentProject')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {stats.projects.registered > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t('dashboard.student.registeredInProject')}
                    </p>
                    <Button asChild className="w-full shadow-lg shadow-primary/20" size="lg">
                      <Link to={ROUTES.STUDENT.FOLLOW_UP}>
                        {t('dashboard.student.followProject')}
                        <ArrowIcon className="ms-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t('dashboard.student.notRegisteredInProject')}
                    </p>
                    <Button asChild className="w-full" size="lg">
                      <Link to={ROUTES.STUDENT.PROJECTS}>
                        {t('dashboard.student.browseAvailableProjects')}
                        <ArrowIcon className="ms-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold tracking-tight">{t('dashboard.student.quickActions')}</h3>
              <div className="grid grid-cols-1 gap-3">
                <QuickActionButton
                  to={ROUTES.STUDENT.PROPOSALS}
                  icon={Plus}
                  label={t('dashboard.student.submitNewProposal')}
                />
                <QuickActionButton
                  to={ROUTES.STUDENT.PROJECTS}
                  icon={Search}
                  label={t('dashboard.student.browseAvailableProjects')}
                />
                <QuickActionButton
                  to={ROUTES.STUDENT.REQUESTS}
                  icon={FileCheck}
                  label={t('dashboard.student.submitNewRequest')}
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  )
}

// Sub-components for cleaner code

function StatsCard({ title, value, icon: Icon, description, color }: any) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    green: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400",
    orange: "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
    purple: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400",
  }

  // @ts-ignore
  const iconColor = colorStyles[color] || colorStyles.blue

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md border-muted">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={cn("p-2 rounded-full", iconColor)}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ icon: Icon, message, actionLabel, actionLink }: any) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      {actionLabel && (
        <Button variant="link" asChild className="mt-2 text-primary">
          <Link to={actionLink}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  )
}

function QuickActionButton({ to, icon: Icon, label }: any) {
  return (
    <Button asChild variant="outline" className="w-full justify-start h-12 px-4 hover:bg-accent hover:text-accent-foreground transition-all duration-200">
      <Link to={to} className="flex items-center">
        <div className="bg-primary/10 p-2 rounded mr-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Icon className="h-4 w-4" />
        </div>
        <span className="font-medium">{label}</span>
      </Link>
    </Button>
  )
}
