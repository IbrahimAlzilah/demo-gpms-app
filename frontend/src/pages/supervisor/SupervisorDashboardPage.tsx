import { MainLayout } from '@/layouts/MainLayout'
import { ROUTES } from '@/lib/constants'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import {
  Briefcase,
  UserCheck,
  ClipboardCheck,
  Calendar,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react'
import { StatsCard as StatsCardComponent } from '@/components/common'

export function SupervisorDashboardPage() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'

  // Mock data - in real app, fetch from API
  const stats = {
    projects: 5,
    pendingRequests: 3,
    upcomingMeetings: 2,
    pendingEvaluations: 4,
  }

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  return (
    <MainLayout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('nav.dashboard', { defaultValue: 'Dashboard' })}</h1>
          <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCardComponent
            title={t('nav.projects')}
            value={stats.projects}
            icon={Briefcase}
            subValue={t('supervisor.projectsUnderSupervision')}
            color="blue"
          />
          <StatsCardComponent
            title={t('nav.supervisionRequests')}
            value={stats.pendingRequests}
            icon={UserCheck}
            subValue={t('supervisor.pendingRequests')}
            color="yellow"
          />
          <StatsCardComponent
            title={t('nav.meetings')}
            value={stats.upcomingMeetings}
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
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Area (2/3) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Urgent Tasks Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight">{t('supervisor.urgentTasks')}</h2>

              <div className="grid gap-3">
                {stats.pendingRequests > 0 && (
                  <TaskRow
                    icon={UserCheck}
                    title={t('supervisor.pendingRequests')}
                    description={t('supervisor.youHavePendingRequests', { count: stats.pendingRequests, defaultValue: `You have ${stats.pendingRequests} pending supervision requests.` })}
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
                    description={t('supervisor.youHavePendingEvaluations', { count: stats.pendingEvaluations, defaultValue: `You have ${stats.pendingEvaluations} pending evaluations.` })}
                    actionLabel={t('nav.evaluations')}
                    actionLink={ROUTES.SUPERVISOR.EVALUATION}
                    type="error"
                    ArrowIcon={ArrowIcon}
                  />
                )}

                {/* Example of empty state if no urgent tasks */}
                {stats.pendingRequests === 0 && stats.pendingEvaluations === 0 && (
                  <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-muted-foreground/25 bg-muted/5">
                    <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full mb-4">
                      <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold">{t('supervisor.allCaughtUp', { defaultValue: 'All caught up!' })}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('supervisor.noUrgentTasks', { defaultValue: 'You have no urgent tasks requiring attention.' })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity Placeholder */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">{t('dashboard.recentActivity', { defaultValue: 'Recent Activity' })}</h2>
              </div>
              <div className="opacity-50 pointer-events-none filter blur-[1px] select-none">
                <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
                  {t('dashboard.activityComingSoon', { defaultValue: 'Recent activity feed coming soon...' })}
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar Area (1/3) */}
          <div className="space-y-8">

            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold tracking-tight">{t('supervisor.quickActions')}</h3>
              <div className="grid grid-cols-1 gap-2">
                <QuickActionButton
                  to={ROUTES.SUPERVISOR.SUPERVISION_REQUESTS}
                  icon={UserCheck}
                  label={t('nav.supervisionRequests')}
                />
                <QuickActionButton
                  to={ROUTES.SUPERVISOR.PROJECTS}
                  icon={Briefcase}
                  label={t('nav.projects')}
                />
                <QuickActionButton
                  to={ROUTES.SUPERVISOR.PROGRESS}
                  icon={TrendingUp}
                  label={t('nav.progress')}
                />
                <QuickActionButton
                  to={ROUTES.SUPERVISOR.EVALUATION}
                  icon={ClipboardCheck}
                  label={t('nav.evaluations')}
                />
              </div>
            </div>

            {/* Upcoming Meetings Preview */}
            <Card className="overflow-hidden border-border bg-card shadow-none">
              <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {t('supervisor.upcomingMeetings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {stats.upcomingMeetings > 0 ? (
                    <>
                      <div className="flex items-start gap-4">
                        <div className="bg-background border px-2 py-1.5 rounded-lg text-center min-w-[52px]">
                          <div className="font-bold text-primary text-lg">15</div>
                          <div className="text-[10px] uppercase text-muted-foreground font-semibold">JAN</div>
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-medium text-sm">Thesis Review - Groups A</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> 10:00 AM - Room 302
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="bg-background border px-2 py-1.5 rounded-lg text-center min-w-[52px]">
                          <div className="font-bold text-primary text-lg">16</div>
                          <div className="text-[10px] uppercase text-muted-foreground font-semibold">JAN</div>
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-medium text-sm">Proposal Defense</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> 02:00 PM - Online
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t('supervisor.noMeetings', { defaultValue: 'No upcoming meetings scheduled.' })}</p>
                  )}

                  <Button variant="outline" className="w-full text-xs h-9 mt-2" size="sm">
                    {t('common.viewCalendar', { defaultValue: 'View Calendar' })}
                  </Button>
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
    ? { icon: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400", border: 'hover:border-red-200' }
    : { icon: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400", border: 'hover:border-orange-200' };

  // @ts-ignore
  const { icon: iconClass, border: borderClass } = typeStyles;

  return (
    <div className={cn("group flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:bg-accent/5", borderClass)}>
      <div className="flex items-start gap-4 w-full sm:w-auto">
        <div className={cn("p-2 rounded-lg shrink-0", iconClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 md:line-clamp-1">{description}</p>
        </div>
      </div>
      <Button asChild variant="ghost" size="sm" className="shrink-0 w-full sm:w-auto">
        <Link to={actionLink}>
          {actionLabel}
          <ArrowIcon className="ms-2 h-4 w-4" />
        </Link>
      </Button>
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
