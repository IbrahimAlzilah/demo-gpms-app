import { MainLayout } from '@/layouts/MainLayout'
import { ROUTES } from '@/lib/constants/constants'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { LoadingSpinner, BlockContent, DashboardHeader } from '@/components/common'
import { useSupervisorDashboard } from './hooks/useSupervisorDashboard'
import { useAuthStore } from '../../pages/auth/login'
import {
  Briefcase,
  UserCheck,
  ClipboardCheck,
  Calendar,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  Users,
  Target
} from 'lucide-react'
import { StatsCard as StatsCardComponent } from '@/components/common'

export function SupervisorDashboardPage() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  const { data, isLoading, error, refetch } = useSupervisorDashboard()
  const { user } = useAuthStore()

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  // Format date for meeting display
  const formatMeetingDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short' }).toUpperCase()
    const time = date.toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
    return { day, month, time }
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
                  {error.message || t('dashboard.supervisor.loadError')}
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
    supervisedProjectsCount: 0,
    pendingSupervisionRequests: 0,
    upcomingMeetingsCount: 0,
    pendingEvaluations: 0,
    overdueMilestonesCount: 0,
  }
  const upcomingMeetings = data?.upcomingMeetings || []
  const overdueMilestones = data?.overdueMilestones || []
  const projectsNeedingAttention = data?.projectsNeedingAttention || []
  const soonMilestones: Array<{ id: string; title: string; projectTitle: string; dueDate: string; daysUntil: number }> = [] // Not provided by backend yet

  return (
    <MainLayout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        {/* <DashboardHeader
          title={t('dashboard.welcomeBack', { name: user?.name, defaultValue: `Welcome back, ${user?.name || 'Supervisor'}` })}
          subtitle={t('dashboard.supervisor.subtitle', { defaultValue: 'Manage your research projects and student progress.' })}
        /> */}
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCardComponent
            title={t('nav.projects')}
            value={stats.supervisedProjectsCount}
            icon={Briefcase}
            subValue={t('supervisor.projectsUnderSupervision')}
            color="blue"
          />
          <StatsCardComponent
            title={t('nav.supervisionRequests')}
            value={stats.pendingSupervisionRequests}
            icon={UserCheck}
            subValue={t('supervisor.pendingRequests')}
            color="yellow"
            trend={stats.pendingSupervisionRequests > 0 ? { value: stats.pendingSupervisionRequests, label: t('supervisor.pendingActions'), positive: false } : undefined}
          />
          <StatsCardComponent
            title={t('nav.meetings')}
            value={stats.upcomingMeetingsCount}
            icon={Calendar}
            subValue={t('supervisor.upcomingMeetings')}
            color="green"
          />
          <StatsCardComponent
            title={t('nav.evaluations')}
            value={stats.pendingEvaluations}
            icon={ClipboardCheck}
            subValue={t('supervisor.pendingEvaluations')}
            color="purple"
            trend={stats.pendingEvaluations > 0 ? { value: stats.pendingEvaluations, label: t('supervisor.needsGrading'), positive: false } : undefined}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Area (2/3) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Urgent Tasks Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight">{t('supervisor.urgentTasks')}</h2>

              <div className="grid gap-4">
                {stats.pendingSupervisionRequests > 0 && (
                  <TaskRow
                    icon={UserCheck}
                    title={t('supervisor.pendingRequests')}
                    description={t('supervisor.youHavePendingRequests', { count: stats.pendingSupervisionRequests })}
                    actionLabel={t('supervisor.review')}
                    actionLink={ROUTES.SUPERVISOR.SUPERVISION_REQUESTS}
                    type="warning"
                    ArrowIcon={ArrowIcon}
                  />
                )}

                {stats.pendingEvaluations > 0 && (
                  <TaskRow
                    icon={ClipboardCheck}
                    title={t('supervisor.pendingEvaluations')}
                    description={t('supervisor.youHavePendingEvaluations', { count: stats.pendingEvaluations })}
                    actionLabel={t('nav.projects')}
                    actionLink={ROUTES.SUPERVISOR.PROJECTS}
                    type="error"
                    ArrowIcon={ArrowIcon}
                  />
                )}

                {stats.overdueMilestonesCount > 0 && (
                  <TaskRow
                    icon={AlertCircle}
                    title={t('supervisor.overdueMilestones')}
                    description={t('supervisor.youHaveOverdueMilestones', { count: stats.overdueMilestonesCount })}
                    actionLabel={t('nav.projects')}
                    actionLink={ROUTES.SUPERVISOR.PROJECTS}
                    type="error"
                    ArrowIcon={ArrowIcon}
                  />
                )}

                {/* Empty state if no urgent tasks */}
                {stats.pendingSupervisionRequests === 0 && stats.pendingEvaluations === 0 && stats.overdueMilestonesCount === 0 && (
                  <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-primary/20 bg-primary/5">
                    <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-full mb-4 ring-4 ring-white dark:ring-background shadow-sm">
                      <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold text-lg">{t('supervisor.allCaughtUp')}</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                      {t('supervisor.noUrgentTasks')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Milestones Section */}
            {(overdueMilestones.length > 0 || soonMilestones.length > 0) && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                  <Target className="h-5 w-5 text-muted-foreground" />
                  {t('supervisor.milestones')}
                </h2>
                <div className="space-y-3">
                  {overdueMilestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-start gap-4 p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10"
                    >
                      <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 shrink-0">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{milestone.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{milestone.projectTitle}</p>
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {t('supervisor.daysOverdue', { count: milestone.daysOverdue })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {soonMilestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all"
                    >
                      <div className="p-2 rounded-lg bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400 shrink-0">
                        <Target className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{milestone.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{milestone.projectTitle}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('supervisor.dueIn', { count: milestone.daysUntil })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions Grid for Supervisor */}
            <div>
              <h2 className="text-lg font-semibold tracking-tight mb-4">{t('supervisor.management')}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md hover:border-primary/20 cursor-pointer">
                  <div className="mb-4 inline-flex p-3 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">{t('nav.projects')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t('supervisor.projectsCardDesc')}</p>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link to={ROUTES.SUPERVISOR.PROJECTS}>{t('common.viewAll')}</Link>
                  </Button>
                </div>

                <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md hover:border-primary/20 cursor-pointer">
                  <div className="mb-4 inline-flex p-3 rounded-lg bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400 group-hover:scale-110 transition-transform">
                    <UserCheck className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">{t('nav.supervisionRequests')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t('supervisor.supervisionRequestsCardDesc')}</p>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link to={ROUTES.SUPERVISOR.SUPERVISION_REQUESTS}>{t('supervisor.review')}</Link>
                  </Button>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar Area (1/3) */}
          <div className="space-y-8">

            {/* Upcoming Meetings Preview */}
            <Card className="overflow-hidden border-border bg-card shadow-sm h-full">
              <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                <CardTitle className="text-base font-medium flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {t('supervisor.upcomingMeetings')}
                  </div>
                  {upcomingMeetings.length > 0 && <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-primary/10 text-primary">{upcomingMeetings.length}</span>}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-0 divide-y divide-border/50">
                  {upcomingMeetings.length > 0 ? (
                    <>
                      {upcomingMeetings.slice(0, 5).map((meeting) => {
                        const { day, month, time } = formatMeetingDate(meeting.scheduledDate)
                        return (
                          <div key={meeting.id} className="flex items-start gap-4 py-4 hover:bg-muted/5 transition-colors px-1">
                            <div className="bg-background border shadow-sm px-2 py-1.5 rounded-lg text-center min-w-[52px] shrink-0">
                              <div className="font-bold text-primary text-xl">{day}</div>
                              <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">{month}</div>
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                              <p className="font-medium text-sm truncate pr-2">{meeting.projectTitle}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {time}
                                </span>
                              </div>
                              {meeting.location && (
                                <p className="text-xs text-muted-foreground truncate">{meeting.location}</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Calendar className="h-10 w-10 text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">{t('supervisor.noMeetings')}</p>
                    </div>
                  )}

                  <div className="pt-4 pb-2">
                    <Button variant="outline" className="w-full text-xs h-9" size="sm" asChild>
                      <Link to={ROUTES.SUPERVISOR.PROJECTS}>
                        {t('common.viewCalendar')}
                      </Link>
                    </Button>
                  </div>
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

function TaskRow({ icon: Icon, title, description, actionLabel, actionLink, type, ArrowIcon }: any) {
  const typeStyles = type === 'error'
    ? { icon: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400", border: 'group-hover:border-red-200 dark:group-hover:border-red-900/50' }
    : { icon: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400", border: 'group-hover:border-amber-200 dark:group-hover:border-amber-900/50' };

  // @ts-ignore
  const { icon: iconClass, border: borderClass } = typeStyles;

  return (
    <div className={cn("group flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md hover:translate-x-1 duration-300", borderClass)}>
      <div className="flex items-start gap-4 w-full sm:w-auto">
        <div className={cn("p-2.5 rounded-lg shrink-0", iconClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 md:line-clamp-1">{description}</p>
        </div>
      </div>
      <Button asChild size="sm" className="shrink-0 w-full sm:w-auto shadow-sm">
        <Link to={actionLink}>
          {actionLabel}
          <ArrowIcon className="ms-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}
