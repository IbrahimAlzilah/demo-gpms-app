import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../../layouts/MainLayout'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { ROUTES } from '../../../lib/constants'
import { Link } from 'react-router-dom'
import {
  Briefcase,
  ClipboardCheck,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  MapPin,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LoadingSpinner, BlockContent, DashboardHeader } from '@/components/common'
import { useDiscussionCommitteeDashboard } from './hooks/useDiscussionCommitteeDashboard'
import { formatRelativeTime } from '@/lib/utils/format'
import { StatsCard as StatsCardComponent } from '@/components/common'
import { useAuthStore } from '../../../pages/auth/login'

export function DiscussionCommitteeDashboardPage() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  const { data, isLoading, error, refetch } = useDiscussionCommitteeDashboard()
  const { user } = useAuthStore()

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  // Format date for defense schedule display
  const formatDefenseDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return t('common.today', { defaultValue: 'Today' })
    } else if (diffDays === 1) {
      return t('common.tomorrow', { defaultValue: 'Tomorrow' })
    }

    const time = date.toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    return `${formatRelativeTime(date)}, ${time}` // Use formatRelativeTime for friendly date logic if needed, or just date.toLocaleDateString for absolute
  }

  // Loading state
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
                  {error.message || t('dashboard.discussion.loadError', { defaultValue: 'Failed to load dashboard data.' })}
                </p>
              </div>
              <Button onClick={() => refetch()} variant="outline" className="mt-2">
                <RefreshCw className="h-4 w-4 me-2" />
                {t('common.retry', { defaultValue: 'Retry' })}
              </Button>
            </div>
          </BlockContent>
        </div>
      </MainLayout>
    )
  }

  const stats = data?.stats || {
    assignedProjectsCount: 0,
    pendingEvaluations: 0,
    completedEvaluations: 0,
    upcomingScheduleCount: 0,
  }
  const pendingEvaluations = data?.pendingEvaluations || []
  const defenseSchedule = data?.defenseSchedule || []

  return (
    <MainLayout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">

        <DashboardHeader
          title={t('dashboard.welcomeBack', { name: user?.name, defaultValue: `Welcome back, ${user?.name || 'Committee Member'}` })}
          subtitle={t('dashboard.discussion.subtitle', { defaultValue: 'Manage student evaluations and defense sessions.' })}
        />

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCardComponent
            title={t('dashboard.discussion.assignedProjects')}
            value={stats.assignedProjectsCount}
            icon={Briefcase}
            subValue={t('dashboard.discussion.assignedToCommittee')}
            color="blue"
          />
          <StatsCardComponent
            title={t('dashboard.discussion.pendingEvaluations')}
            value={stats.pendingEvaluations}
            icon={ClipboardCheck}
            subValue={t('dashboard.discussion.awaitingReview')}
            color="yellow"
            trend={stats.pendingEvaluations > 0 ? { value: stats.pendingEvaluations, label: "pending", positive: false } : undefined}
          />
          <StatsCardComponent
            title={t('dashboard.discussion.upcomingDefenses', { defaultValue: 'Upcoming Defenses' })}
            value={stats.upcomingScheduleCount}
            icon={Calendar}
            subValue={t('dashboard.discussion.scheduledThisWeek', { defaultValue: 'Scheduled this week' })}
            color="purple"
          />
          <StatsCardComponent
            title={t('dashboard.discussion.completed', { defaultValue: 'Completed' })}
            value={stats.completedEvaluations}
            icon={CheckCircle2}
            subValue={t('dashboard.discussion.totalEvaluated', { defaultValue: 'Total projects evaluated' })}
            color="green"
            trend={{ value: stats.completedEvaluations, label: "total", positive: true }}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Area (2/3) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Pending Evaluations Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold tracking-tight">{t('dashboard.discussion.pendingEvaluations')}</h2>
              </div>

              <div className="grid gap-3">
                {pendingEvaluations.length > 0 ? (
                  pendingEvaluations.map((evaluation) => (
                    <div key={evaluation.projectId} className="group flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:translate-x-1 duration-300 hover:shadow-md hover:border-primary/20">
                      <div className="flex items-start gap-4 w-full sm:w-auto">
                        <div className="p-2.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-600 dark:text-yellow-400 shrink-0 group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900/30 transition-colors">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{evaluation.projectTitle}</h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatRelativeTime(evaluation.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button asChild size="sm" className="shrink-0 w-full sm:w-auto shadow-sm">
                        <Link to={`${ROUTES.DISCUSSION_COMMITTEE.EVALUATION}?projectId=${evaluation.projectId}`}>
                          {t('dashboard.discussion.evaluate', { defaultValue: 'Evaluate' })}
                          <ArrowIcon className="ms-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-primary/20 bg-primary/5">
                    <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-full mb-4 ring-4 ring-white dark:ring-background shadow-sm">
                      <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold text-lg">{t('dashboard.discussion.allCaughtUp', { defaultValue: 'All evaluations complete!' })}</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                      You have no pending evaluations.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar Area (1/3) */}
          <div className="space-y-8">

            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold tracking-tight">{t('dashboard.discussion.quickActions')}</h3>
              <div className="grid grid-cols-1 gap-2">
                <QuickActionButton
                  to={ROUTES.DISCUSSION_COMMITTEE.PROJECTS}
                  icon={Briefcase}
                  label={t('dashboard.discussion.viewProjects')}
                />
                <QuickActionButton
                  to={ROUTES.DISCUSSION_COMMITTEE.EVALUATION}
                  icon={ClipboardCheck}
                  label={t('dashboard.discussion.finalEvaluation')}
                />
              </div>
            </div>

            {/* Defense Schedule Widget */}
            <Card className="border-border bg-card shadow-sm overflow-hidden">
              <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                <CardTitle className="text-base font-medium flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {t('dashboard.discussion.defenseSchedule', { defaultValue: 'Defense Schedule' })}
                  </div>
                  {defenseSchedule.length > 0 && <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-primary/10 text-primary">{defenseSchedule.length}</span>}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {defenseSchedule.length > 0 ? (
                    <>
                      <div className="relative border-l-2 border-primary/10 pl-6 ml-2 space-y-8">
                        {defenseSchedule.map((defense, index) => (
                          <div key={`${defense.projectId}-${index}`} className="relative group">
                            {/* Roadmap Dot */}
                            <span className={cn(
                              "absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 transition-colors duration-300",
                              index === 0 ? "bg-primary border-primary ring-4 ring-primary/20" : "bg-card border-muted-foreground/30 group-hover:border-primary group-hover:bg-primary/50"
                            )} />

                            <div className="space-y-1">
                              <p className={cn(
                                "text-sm font-medium leading-none transition-colors",
                                index === 0 ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                              )}>
                                {defense.projectTitle}
                              </p>
                              {defense.title && (
                                <p className="text-xs text-muted-foreground">{defense.title}</p>
                              )}
                              <div className="flex flex-col gap-1 pt-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                  <Clock className="w-3 h-3" />
                                  {new Date(defense.scheduledDate).toLocaleDateString()} at {new Date(defense.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {defense.location && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3" />
                                    {defense.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" className="w-full text-xs h-9" asChild>
                        <Link to={ROUTES.DISCUSSION_COMMITTEE.PROJECTS}>
                          {t('common.viewFullSchedule', { defaultValue: 'View Full Schedule' })}
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Calendar className="h-10 w-10 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">
                        {t('dashboard.discussion.noDefensesScheduled', { defaultValue: 'No defense sessions scheduled.' })}
                      </p>
                      <Button variant="outline" className="mt-4 text-xs h-9" asChild>
                        <Link to={ROUTES.DISCUSSION_COMMITTEE.PROJECTS}>
                          {t('dashboard.discussion.viewProjects', { defaultValue: 'View Projects' })}
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </MainLayout>
  )
}

// Sub-components
function QuickActionButton({ to, icon: Icon, label, description }: any) {
  return (
    <Button asChild variant="outline" className="w-full justify-start h-auto py-3 px-4 bg-card hover:bg-accent hover:text-accent-foreground border-border shadow-none transition-all duration-200 group">
      <Link to={to} className="flex items-center">
        <div className="p-2 rounded-md bg-muted group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary transition-colors mr-3">
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-left">
          <span className="font-medium block">{label}</span>
          {description && <span className="text-xs text-muted-foreground font-normal mt-0.5 block">{description}</span>}
        </div>
        <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground/50 group-hover:text-primary/50 transition-colors" />
      </Link>
    </Button>
  )
}
