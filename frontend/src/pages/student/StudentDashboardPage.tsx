import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { MainLayout } from '../../layouts/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { LoadingSpinner, BlockContent } from '../../components/common'
import { useProposals } from './proposals'
import { useRequests } from './requests'
import { useProjects } from './projects'
import { useDocuments } from './documents'
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
  AlertCircle,
  RefreshCw,
  type LucideIcon
} from 'lucide-react'
import { StatusBadge, StatsCard as StatsCardComponent } from '@/components/common'
import { formatRelativeTime } from '../../lib/utils/format'

export function StudentDashboardPage() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  const { user } = useAuthStore()
  const { data: proposals, isLoading: proposalsLoading, error: proposalsError, refetch: refetchProposals } = useProposals()
  const { data: requests, isLoading: requestsLoading, error: requestsError, refetch: refetchRequests } = useRequests()
  const { data: projects, isLoading: projectsLoading, error: projectsError, refetch: refetchProjects } = useProjects()

  // Get user's registered project
  const userProject = useMemo(() => {
    return projects?.find((p) => p.students.some((s) => s.id === user?.id))
  }, [projects, user?.id])

  // Fetch documents for user's project (if they have one)
  const { data: documents, isLoading: documentsLoading, error: documentsError, refetch: refetchDocuments } = useDocuments(userProject?.id)

  const isLoading = proposalsLoading || requestsLoading || projectsLoading || documentsLoading
  const error = proposalsError || requestsError || projectsError || documentsError

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
    documents: {
      total: documents?.length || 0,
    },
  }

  // Get recent proposals
  const recentProposals = proposals
    ?.filter((p) => p.submitterId === user?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  // Refetch all queries
  const refetchAll = () => {
    refetchProposals()
    refetchRequests()
    refetchProjects()
    refetchDocuments()
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner />
        </div>
      </MainLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <MainLayout>
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
          <BlockContent variant="container" className="border-destructive">
            <div className="flex flex-col items-center justify-center gap-4 p-8">
              <div className="bg-destructive/10 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-destructive">{t('common.error', { defaultValue: 'Error' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {error instanceof Error ? error.message : t('dashboard.student.loadError', { defaultValue: 'Failed to load dashboard data.' })}
                </p>
              </div>
              <Button onClick={refetchAll} variant="outline" className="mt-2">
                <RefreshCw className="h-4 w-4 me-2" />
                {t('common.retry', { defaultValue: 'Retry' })}
              </Button>
            </div>
          </BlockContent>
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
          <StatsCardComponent
            title={t('dashboard.student.proposals')}
            value={stats.proposals.total}
            icon={FileText}
            color="green"
          />

          <StatsCardComponent
            title={t('dashboard.student.projects')}
            value={stats.projects.registered}
            icon={Folder}
            color="blue"
          />

          <StatsCardComponent
            title={t('dashboard.student.requests')}
            value={stats.requests.total}
            icon={Send}
            color="yellow"
          />

          <StatsCardComponent
            title={t('nav.documents',)}
            value={stats.documents.total}
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
