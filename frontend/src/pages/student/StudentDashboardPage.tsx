import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../layouts/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { LoadingSpinner, BlockContent, DashboardHeader } from '../../components/common'
import { useStudentDashboard } from './hooks/useStudentDashboard'
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
  AlertCircle,
  RefreshCw,
  MoreHorizontal,
  ChevronRight,
  type LucideIcon,
  BookOpen,
  Calendar,
  Target,
  Bell
} from 'lucide-react'
import { StatusBadge, StatsCard as StatsCardComponent } from '@/components/common'
import { formatRelativeTime } from '../../lib/utils/format'
import { cn } from '@/lib/utils'

export function StudentDashboardPage() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  const { user } = useAuthStore()
  const { data, isLoading, error, refetch } = useStudentDashboard()

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner />
        </div>
      </MainLayout>
    )
  }

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
                  {error.message || t('dashboard.student.loadError', { defaultValue: 'Failed to load dashboard data.' })}
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
    myProjectStatus: null,
    progressPercentage: 0,
    pendingProposals: 0,
    pendingRequests: 0,
    documentsSubmittedCount: 0,
    unreadNotifications: 0,
  }

  const myProject = data?.myProject || null
  const activeTimeWindows = data?.activeTimeWindows || []
  const timeline = data?.timeline || { upcomingMilestones: [], upcomingMeetings: [] }

  return (
    <MainLayout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        {/* Stats Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <StatsCardComponent
            title={t('dashboard.student.proposals')}
            value={stats.pendingProposals}
            icon={FileText}
            subValue={t('dashboard.student.pendingProposals', { count: stats.pendingProposals })}
            color="blue"
          />
          <StatsCardComponent
            title={t('dashboard.student.projects')}
            value={myProject ? 1 : 0}
            icon={Briefcase}
            subValue={myProject ? t('dashboard.student.activeProject') : t('dashboard.student.noActiveProject')}
            color="purple"
          />
          <StatsCardComponent
            title={t('dashboard.student.requests')}
            value={stats.pendingRequests}
            icon={FileCheck}
            subValue={t('dashboard.student.pendingRequests', { count: stats.pendingRequests })}
            color="yellow"
          />
          <StatsCardComponent
            title={t('nav.documents')}
            value={stats.documentsSubmittedCount}
            icon={BookOpen}
            color="green"
            subValue={t('dashboard.student.documentsSubmitted')}
          />
        </div>

        {/* Active Time Windows Alert */}
        {activeTimeWindows.length > 0 && (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">{t('dashboard.student.activeWindows', { defaultValue: 'Active Time Windows' })}</h3>
                  <div className="space-y-2">
                    {activeTimeWindows.map((window) => (
                      <div key={window.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                        <div>
                          <p className="font-medium text-sm">{window.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {t('dashboard.student.endsIn', { count: window.daysRemaining, defaultValue: `Ends in ${window.daysRemaining} days` })}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-primary">{window.daysRemaining}d</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Area (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Status / Journey */}
            {myProject ? (
              <Card className="overflow-hidden border-border bg-gradient-to-br from-card to-card/50 shadow-sm">
                <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      {myProject.title}
                    </CardTitle>
                    <StatusBadge status={myProject.status} />
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t('project.role')}</p>
                        <p className="font-medium mt-1">{t('user.role.student')}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t('project.supervisor')}</p>
                        <p className="font-medium mt-1">{myProject.supervisor?.name || t('common.notAssigned', { defaultValue: 'Not Assigned' })}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t('dashboard.student.progress')}</p>
                        <p className="font-medium mt-1">{stats.progressPercentage}%</p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button asChild variant="default" className="w-full sm:w-auto">
                        <Link to={ROUTES.STUDENT.FOLLOW_UP}>
                          {t('dashboard.student.followProject')}
                          <ArrowIcon className="ms-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Folder className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('dashboard.student.noProjectTitle', { defaultValue: 'Start Your Journey' })}</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  {t('dashboard.student.noProjectDesc', { defaultValue: 'You are not registered in any project yet. Browse available projects or submit your own proposal to get started.' })}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild size="lg" className="shadow-md">
                    <Link to={ROUTES.STUDENT.PROPOSALS}>
                      <Plus className="mr-2 h-4 w-4" />
                      {t('dashboard.student.submitProposal')}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="bg-background">
                    <Link to={ROUTES.STUDENT.PROJECTS}>
                      <Search className="mr-2 h-4 w-4" />
                      {t('dashboard.student.browseProjects')}
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Timeline Section */}
            {(timeline.upcomingMilestones.length > 0 || timeline.upcomingMeetings.length > 0) && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  {t('dashboard.student.timeline', { defaultValue: 'Upcoming Timeline' })}
                </h2>

                <div className="space-y-3">
                  {/* Upcoming Milestones */}
                  {timeline.upcomingMilestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all"
                    >
                      <div className={cn(
                        "p-2 rounded-lg shrink-0",
                        milestone.isOverdue
                          ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                          : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                      )}>
                        <Target className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{milestone.title}</h3>
                        {milestone.description && (
                          <p className="text-xs text-muted-foreground mt-1">{milestone.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {milestone.isOverdue
                              ? t('dashboard.student.overdue', { count: milestone.daysUntil, defaultValue: `${milestone.daysUntil} days overdue` })
                              : t('dashboard.student.dueIn', { count: milestone.daysUntil, defaultValue: `Due in ${milestone.daysUntil} days` })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Upcoming Meetings */}
                  {timeline.upcomingMeetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all"
                    >
                      <div className="p-2 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 shrink-0">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{t('dashboard.student.meeting', { defaultValue: 'Project Meeting' })}</h3>
                        {meeting.agenda && (
                          <p className="text-xs text-muted-foreground mt-1">{meeting.agenda}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(meeting.scheduledDate).toLocaleString()}</span>
                          {meeting.location && (
                            <>
                              <span>•</span>
                              <span>{meeting.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Area (1/3) */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <Card className="border-none shadow-none bg-transparent">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1 rounded bg-primary/10">
                  <MoreHorizontal className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-base font-semibold tracking-tight">{t('dashboard.student.quickActions')}</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <QuickActionButton
                  to={ROUTES.STUDENT.PROPOSALS}
                  icon={Plus}
                  label={t('dashboard.student.submitNewProposal')}
                  description={t('dashboard.student.proposalDesc', { defaultValue: 'Start a new project proposal' })}
                  color="blue"
                />
                <QuickActionButton
                  to={ROUTES.STUDENT.PROJECTS}
                  icon={Search}
                  label={t('dashboard.student.browseAvailableProjects')}
                  description={t('dashboard.student.browseDesc', { defaultValue: 'Find projects to join' })}
                  color="purple"
                />
                <QuickActionButton
                  to={ROUTES.STUDENT.REQUESTS}
                  icon={FileCheck}
                  label={t('dashboard.student.submitNewRequest')}
                  description={t('dashboard.student.requestDesc', { defaultValue: 'Submit administrative requests' })}
                  color="yellow"
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

// Sub-components
interface QuickActionButtonProps {
  to: string
  icon: LucideIcon
  label: string
  description?: string
  color?: 'blue' | 'purple' | 'yellow' | 'green'
}

function QuickActionButton({ to, icon: Icon, label, description, color = 'blue' }: QuickActionButtonProps) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30",
    yellow: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400 group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900/30",
    green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-900/30",
  }

  return (
    <Link to={to} className="group flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-md hover:border-primary/20 transition-all duration-300">
      <div className={cn("p-2.5 rounded-lg transition-colors shrink-0", colorStyles[color])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{label}</h3>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </Link>
  )
}
