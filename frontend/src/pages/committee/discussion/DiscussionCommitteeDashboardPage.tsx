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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LoadingSpinner, BlockContent } from '@/components/common'
import { useDiscussionCommitteeDashboard } from './hooks/useDiscussionCommitteeDashboard'
import { formatRelativeTime } from '@/lib/utils/format'

export function DiscussionCommitteeDashboardPage() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  const { data, isLoading, error, refetch } = useDiscussionCommitteeDashboard()

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
    return `${formatRelativeTime(date)}, ${time}`
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

  const stats = data.stats
  const pendingEvaluations = data.pendingEvaluations
  const defenseSchedule = data.defenseSchedule

  return (
    <MainLayout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('dashboard.welcome', { defaultValue: 'Discussion Committee' })}</h1>
          <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title={t('dashboard.discussion.assignedProjects')}
            value={stats.assignedProjects}
            icon={Briefcase}
            subValue={t('dashboard.discussion.assignedToCommittee')}
            color="blue"
          />
          <StatsCard
            title={t('dashboard.discussion.pendingEvaluations')}
            value={stats.pendingEvaluations}
            icon={ClipboardCheck}
            subValue={t('dashboard.discussion.awaitingReview')}
            color="orange"
          />
          <StatsCard
            title={t('dashboard.discussion.upcomingDefenses', { defaultValue: 'Upcoming Defenses' })}
            value={stats.upcomingDefenses}
            icon={Calendar}
            subValue={t('dashboard.discussion.scheduledThisWeek', { defaultValue: 'Scheduled this week' })}
            color="purple"
          />
          <StatsCard
            title={t('dashboard.discussion.completed', { defaultValue: 'Completed' })}
            value={stats.completedEvaluations}
            icon={CheckCircle2}
            subValue={t('dashboard.discussion.totalEvaluated', { defaultValue: 'Total projects evaluated' })}
            color="green"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Area (2/3) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Urgent Tasks Section / Pending Evaluations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">{t('dashboard.discussion.pendingEvaluations')}</h2>
              </div>

              <div className="grid gap-3">
                {pendingEvaluations.length > 0 ? (
                  pendingEvaluations.map((evaluation) => (
                    <div key={evaluation.projectId} className="group flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:bg-accent/5 hover:border-primary/20">
                      <div className="flex items-start gap-3 w-full sm:w-auto">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 shrink-0">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm group-hover:text-primary transition-colors">{evaluation.projectTitle}</h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(evaluation.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Button asChild size="sm" variant="ghost" className="shrink-0 w-full sm:w-auto">
                        <Link to={`${ROUTES.DISCUSSION_COMMITTEE.EVALUATION}?projectId=${evaluation.projectId}`}>
                          {t('dashboard.discussion.evaluate', { defaultValue: 'Evaluate' })}
                          <ArrowIcon className="ms-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-muted-foreground/25 bg-muted/5">
                    <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full mb-4">
                      <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold">{t('dashboard.discussion.allCaughtUp', { defaultValue: 'All evaluations complete!' })}</h3>
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
            <Card className="border-border bg-card shadow-none">
              <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {t('dashboard.discussion.defenseSchedule', { defaultValue: 'Defense Schedule' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {defenseSchedule.length > 0 ? (
                    <>
                      <div className="relative border-l-2 border-primary/20 pl-4 ml-2 space-y-6">
                        {defenseSchedule.map((defense, index) => (
                          <div key={defense.projectId} className="relative">
                            <span className={`absolute -left-[21px] top-1.5 h-3 w-3 rounded-full ring-4 ring-card ${
                              index === 0 ? 'bg-primary' : 'bg-muted-foreground/30'
                            }`} />
                            <p className={`text-sm font-medium ${index === 0 ? '' : 'text-muted-foreground'}`}>
                              {defense.projectTitle}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" /> {formatDefenseDate(defense.scheduledDate)}
                              {defense.location && ` - ${defense.location}`}
                            </p>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" className="w-full h-8 text-xs" asChild>
                        <Link to={ROUTES.DISCUSSION_COMMITTEE.PROJECTS}>
                          {t('common.viewFullSchedule', { defaultValue: 'View Full Schedule' })}
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        {t('dashboard.discussion.noDefensesScheduled', { defaultValue: 'No defense schedules available.' })}
                      </p>
                      <Button variant="outline" className="w-full h-8 text-xs" asChild>
                        <Link to={ROUTES.DISCUSSION_COMMITTEE.PROJECTS}>
                          {t('dashboard.discussion.viewProjects', { defaultValue: 'View Projects' })}
                        </Link>
                      </Button>
                    </>
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

function StatsCard({ title, value, icon: Icon, subValue, color }: any) {
  const colorStyles = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    green: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    orange: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    purple: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
  }

  // @ts-ignore
  const iconColor = colorStyles[color] || colorStyles.blue

  return (
    <div className="rounded-xl border border-border bg-card p-6 flex flex-col justify-between h-full transition-colors hover:border-primary/20">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2.5 rounded-lg", iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
      </div>
      <div>
        <h3 className="font-medium text-sm text-foreground mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground">{subValue}</p>
      </div>
    </div>
  )
}

function QuickActionButton({ to, icon: Icon, label }: any) {
  return (
    <Button asChild variant="outline" className="w-full justify-start h-11 px-4 bg-card hover:bg-accent hover:text-accent-foreground border-border shadow-none transition-all duration-200">
      <Link to={to} className="flex items-center">
        <Icon className="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="font-medium">{label}</span>
      </Link>
    </Button>
  )
}
