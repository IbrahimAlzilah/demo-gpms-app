import { MainLayout } from '@/layouts/MainLayout'
import { ROUTES } from '@/lib/constants'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import {
  Briefcase,
  UserCheck,
  ClipboardCheck,
  Calendar,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Search,
  AlertCircle
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/pages/auth/login'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function SupervisorDashboardPage() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  const { user } = useAuthStore()

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
      <div className="space-y-8 animate-in fade-in duration-700 pb-10">

        {/* Welcome Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('dashboard.welcome', { defaultValue: 'Welcome back' })}, {user?.name || 'Supervisor'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('dashboard.supervisor.subtitle', { defaultValue: 'Manage your students, proposals, and evaluations efficiently.' })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title={t('nav.projects')}
            value={stats.projects}
            icon={Briefcase}
            description={t('supervisor.projectsUnderSupervision')}
            color="blue"
          />
          <StatsCard
            title={t('nav.supervisionRequests')}
            value={stats.pendingRequests}
            icon={UserCheck}
            description={t('supervisor.pendingRequests')}
            color="orange"
            trend={stats.pendingRequests > 0 ? 'warning' : 'neutral'}
          />
          <StatsCard
            title={t('nav.meetings')}
            value={stats.upcomingMeetings}
            icon={Calendar}
            description={t('supervisor.upcomingMeetings')}
            color="purple"
          />
          <StatsCard
            title={t('nav.evaluations')}
            value={stats.pendingEvaluations}
            icon={ClipboardCheck}
            description={t('supervisor.pendingEvaluations')}
            color="red"
            trend={stats.pendingEvaluations > 0 ? 'warning' : 'neutral'}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Area (2/3) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Urgent Tasks Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight">{t('supervisor.urgentTasks')}</h2>

              <div className="grid gap-4">
                {stats.pendingRequests > 0 && (
                  <TaskCard
                    icon={UserCheck}
                    title={t('supervisor.pendingRequests')}
                    count={stats.pendingRequests}
                    description={t('supervisor.youHavePendingRequests', { count: stats.pendingRequests, defaultValue: `You have ${stats.pendingRequests} pending supervision requests.` })}
                    actionLabel={t('supervisor.review')}
                    actionLink={ROUTES.SUPERVISOR.SUPERVISION_REQUESTS}
                    type="warning"
                    ArrowIcon={ArrowIcon}
                  />
                )}

                {stats.pendingEvaluations > 0 && (
                  <TaskCard
                    icon={ClipboardCheck}
                    title={t('supervisor.pendingEvaluations')}
                    count={stats.pendingEvaluations}
                    description={t('supervisor.youHavePendingEvaluations', { count: stats.pendingEvaluations, defaultValue: `You have ${stats.pendingEvaluations} pending evaluations.` })}
                    actionLabel={t('nav.evaluations')}
                    actionLink={ROUTES.SUPERVISOR.EVALUATION}
                    type="error"
                    ArrowIcon={ArrowIcon}
                  />
                )}

                {/* Example of empty state if no urgent tasks */}
                {stats.pendingRequests === 0 && stats.pendingEvaluations === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full mb-4">
                        <ClipboardCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="font-semibold">{t('supervisor.allCaughtUp', { defaultValue: 'All caught up!' })}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('supervisor.noUrgentTasks', { defaultValue: 'You have no urgent tasks requiring attention.' })}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Recent Activity Placeholder - To be implemented based on api */}
            <div className="space-y-4 opacity-50 pointer-events-none filter blur-[1px]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">{t('dashboard.recentActivity', { defaultValue: 'Recent Activity' })}</h2>
              </div>
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  {t('dashboard.activityComingSoon', { defaultValue: 'Recent activity feed coming soon...' })}
                </CardContent>
              </Card>
            </div>

          </div>

          {/* Sidebar Area (1/3) */}
          <div className="space-y-8">

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('supervisor.quickActions')}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
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
              </CardContent>
            </Card>

            {/* Upcoming Meetings Preview */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="border-b border-primary/10 bg-primary/10 pb-4">
                <CardTitle className="text-primary flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  {t('supervisor.upcomingMeetings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {stats.upcomingMeetings > 0 ? (
                    <>
                      <div className="flex items-start gap-3 text-sm">
                        <div className="bg-background border px-2 py-1 rounded text-center min-w-[50px]">
                          <div className="font-bold text-primary">15</div>
                          <div className="text-[10px] uppercase text-muted-foreground">JAN</div>
                        </div>
                        <div>
                          <p className="font-medium">Thesis Review - Groups A</p>
                          <p className="text-xs text-muted-foreground">10:00 AM - Room 302</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <div className="bg-background border px-2 py-1 rounded text-center min-w-[50px]">
                          <div className="font-bold text-primary">16</div>
                          <div className="text-[10px] uppercase text-muted-foreground">JAN</div>
                        </div>
                        <div>
                          <p className="font-medium">Proposal Defense</p>
                          <p className="text-xs text-muted-foreground">02:00 PM - Online</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t('supervisor.noMeetings', { defaultValue: 'No upcoming meetings scheduled.' })}</p>
                  )}

                  <Button variant="outline" className="w-full text-xs h-8" size="sm">
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

function StatsCard({ title, value, icon: Icon, description, color }: any) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    green: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400",
    orange: "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
    purple: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400",
    red: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400",
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

function TaskCard({ icon: Icon, title, count, description, actionLabel, actionLink, type, ArrowIcon }: any) {
  const styles = type === 'error'
    ? "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/10 hover:border-red-300 dark:hover:border-red-800"
    : "border-orange-200 bg-orange-50/50 dark:border-orange-900/50 dark:bg-orange-950/10 hover:border-orange-300 dark:hover:border-orange-800";

  const iconStyle = type === 'error' ? "text-red-600 dark:text-red-400" : "text-orange-600 dark:text-orange-400";
  const buttonStyle = type === 'error' ? "hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30" : "hover:text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30";

  return (
    <Card className={cn("transition-all duration-300", styles)}>
      <CardContent className="p-5 flex items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={cn("p-2 bg-background rounded-full shadow-sm", iconStyle)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button asChild variant="ghost" size="sm" className={cn("shrink-0", buttonStyle)}>
          <Link to={actionLink}>
            {actionLabel}
            <ArrowIcon className="ms-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
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
