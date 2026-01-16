import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../layouts/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
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
  ArrowLeft,
  ArrowRight,
  Plus,
  Search,
  Clock,
  Folder,
  Send,
  Upload,
  type LucideIcon
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
    },
    requests: {
      total: requests?.length || 0,
      pending: requests?.filter((r) => r.status === 'pending').length || 0,
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
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">

        {/* Stats Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title={t('dashboard.student.proposals')}
            value={stats.proposals.total}
            icon={FileText}
            color="green"
          />

          <StatsCard
            title={t('dashboard.student.projects')}
            value={stats.projects.registered}
            icon={Folder}
            color="blue"
          />

          <StatsCard
            title={t('dashboard.student.requests')}
            value={stats.requests.total}
            icon={Send}
            color="yellow"
          />

          <StatsCard
            title={t('nav.documents',)}
            value="12"
            icon={Upload}
            color="purple"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Area (2/3) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Recent Proposals Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                  {t('dashboard.student.recentProposals')}
                </h2>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 h-8" asChild>
                  <Link to={ROUTES.STUDENT.PROPOSALS}>
                    {t('common.viewAll')} <ArrowIcon className="ms-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-3">
                {recentProposals && recentProposals.length > 0 ? (
                  recentProposals.map((proposal) => (
                    <div
                      key={proposal.id}
                      className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:bg-accent/5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-medium text-base group-hover:text-primary transition-colors">{proposal.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatRelativeTime(proposal.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={proposal.status} />
                    </div>
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

          </div>

          {/* Sidebar Area (1/3) */}
          <div className="space-y-8">

            {/* Current Project Status - Clean Card */}
            <Card className="overflow-hidden border-border bg-card shadow-none">
              <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  {t('dashboard.student.currentProject')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {stats.projects.registered > 0 ? (
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-sm font-medium text-primary">
                        {t('dashboard.student.registeredInProject')}
                      </p>
                    </div>
                    <Button asChild className="w-full" size="default">
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
                    <Button asChild className="w-full" variant="outline">
                      <Link to={ROUTES.STUDENT.PROJECTS}>
                        {t('dashboard.student.browseAvailableProjects')}
                        <ArrowIcon className="ms-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions - Clean List */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold tracking-tight">{t('dashboard.student.quickActions')}</h3>
              <div className="grid grid-cols-1 gap-2">
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

// Simplified Sub-components

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  subValue?: string
  color?: 'blue' | 'green' | 'yellow' | 'purple'
}

function StatsCard({ title, value, icon: Icon, subValue, color = 'blue' }: StatsCardProps) {
  const colorStyles: Record<'blue' | 'green' | 'yellow' | 'purple', string> = {
    blue: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
    green: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
    yellow: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
    purple: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
  }

  const style = colorStyles[color]

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between transition-all duration-300">

      {/* Content Section */}
      <div className="flex flex-col space-y-1">
        <h3 className="text-sm font-medium text-muted-foreground/80">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
        </div>
        {subValue && <p className="text-xs font-medium text-muted-foreground/80 mt-1">{subValue}</p>}
      </div>

      {/* Icon Section */}
      <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105", style)}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  )
}

interface EmptyStateProps {
  icon: LucideIcon
  message: string
  actionLabel?: string
  actionLink?: string
}

function EmptyState({ icon: Icon, message, actionLabel, actionLink }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/25 p-8 text-center bg-muted/5">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="mt-3 text-sm text-muted-foreground font-medium">{message}</p>
      {actionLabel && actionLink && (
        <Button variant="link" asChild className="mt-1 h-auto p-0 text-primary">
          <Link to={actionLink as string}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  )
}

interface QuickActionButtonProps {
  to: string
  icon: LucideIcon
  label: string
}

function QuickActionButton({ to, icon: Icon, label }: QuickActionButtonProps) {
  return (
    <Button asChild variant="outline" className="w-full justify-start h-11 px-4 bg-card hover:bg-accent hover:text-accent-foreground border-border shadow-none transition-all duration-200">
      <Link to={to} className="flex items-center">
        <Icon className="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="font-medium">{label}</span>
      </Link>
    </Button>
  )
}
