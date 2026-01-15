import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../../layouts/MainLayout'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { ROUTES } from '../../../lib/constants'
import { Link } from 'react-router-dom'
import {
  Calendar,
  FileText,
  Megaphone,
  UserPlus,
  FileCheck,
  Users,
  FileBarChart,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/pages/auth/login'

export function ProjectsCommitteeDashboardPage() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  const { user } = useAuthStore()

  // Mock data - in real app, fetch from API
  const stats = {
    pendingProposals: 12,
    pendingRequests: 8,
    projectsToAnnounce: 5,
    supervisorsToAssign: 3,
  }

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  return (
    <MainLayout>
      <div className="space-y-8 animate-in fade-in duration-700 pb-10">

        {/* Welcome Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('dashboard.welcome', { defaultValue: 'Projects Committee' })}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('dashboard.committee.subtitle', { defaultValue: 'Oversee project lifecycles, manage proposals, and coordinate with supervisors.' })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title={t('dashboard.committee.proposals')}
            value={stats.pendingProposals}
            icon={FileText}
            description={t('dashboard.committee.pendingReview')}
            color="blue"
            trend={stats.pendingProposals > 10 ? 'warning' : 'neutral'}
          />
          <StatsCard
            title={t('dashboard.committee.requests')}
            value={stats.pendingRequests}
            icon={FileCheck}
            description={t('dashboard.committee.pendingRequests')}
            color="orange"
            trend={stats.pendingRequests > 5 ? 'warning' : 'neutral'}
          />
          <StatsCard
            title={t('dashboard.committee.projects')}
            value={stats.projectsToAnnounce}
            icon={Megaphone}
            description={t('dashboard.committee.projectsToAnnounce')}
            color="green"
          />
          <StatsCard
            title={t('dashboard.committee.supervisors')}
            value={stats.supervisorsToAssign}
            icon={UserPlus}
            description={t('dashboard.committee.projectsNeedSupervisors')}
            color="purple"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Area (2/3) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Urgent Tasks Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight">{t('dashboard.committee.urgentTasks')}</h2>

              <div className="grid gap-4">
                {stats.pendingProposals > 0 && (
                  <TaskCard
                    icon={FileText}
                    title={t('dashboard.committee.proposalsToReview', { count: stats.pendingProposals })}
                    count={stats.pendingProposals}
                    description={t('dashboard.committee.reviewProposalsDesc', { defaultValue: 'New proposals are waiting for your review.' })}
                    actionLabel={t('dashboard.committee.review')}
                    actionLink={ROUTES.PROJECTS_COMMITTEE.PROPOSALS}
                    type="warning"
                    ArrowIcon={ArrowIcon}
                  />
                )}

                {stats.pendingRequests > 0 && (
                  <TaskCard
                    icon={FileCheck}
                    title={t('dashboard.committee.requestsToProcess', { count: stats.pendingRequests })}
                    count={stats.pendingRequests}
                    description={t('dashboard.committee.processRequestsDesc', { defaultValue: 'Student requests require committee approval.' })}
                    actionLabel={t('dashboard.committee.process')}
                    actionLink={ROUTES.PROJECTS_COMMITTEE.REQUESTS}
                    type="info"
                    ArrowIcon={ArrowIcon}
                  />
                )}

                {/* Example of empty state if no urgent tasks */}
                {stats.pendingProposals === 0 && stats.pendingRequests === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full mb-4">
                        <FileCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="font-semibold">{t('dashboard.committee.allCaughtUp', { defaultValue: 'All caught up!' })}</h3>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Workflow Timeline Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.committee.currentPhase', { defaultValue: 'Current Phase' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-primary">{t('phase.proposalSubmission', { defaultValue: 'Proposal Submission' })}</span>
                    <span className="text-muted-foreground">{t('common.endsIn', { defaultValue: 'Ends in 3 days' })}</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[75%]" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('phase.nextPhase', { defaultValue: 'Next: Project Announcement' })}
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar Area (1/3) */}
          <div className="space-y-8">

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.committee.quickActions')}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <QuickActionButton
                  to={ROUTES.PROJECTS_COMMITTEE.PERIODS}
                  icon={Calendar}
                  label={t('dashboard.committee.announcePeriods')}
                />
                <QuickActionButton
                  to={ROUTES.PROJECTS_COMMITTEE.PROPOSALS}
                  icon={FileText}
                  label={t('dashboard.committee.manageProposals')}
                />
                <QuickActionButton
                  to={ROUTES.PROJECTS_COMMITTEE.ANNOUNCE_PROJECTS}
                  icon={Megaphone}
                  label={t('dashboard.committee.announceProjects')}
                />
                <QuickActionButton
                  to={ROUTES.PROJECTS_COMMITTEE.ASSIGN_SUPERVISORS}
                  icon={UserPlus}
                  label={t('dashboard.committee.assignSupervisors')}
                />
                <QuickActionButton
                  to={ROUTES.PROJECTS_COMMITTEE.REQUESTS}
                  icon={FileCheck}
                  label={t('dashboard.committee.processRequests')}
                />
                <QuickActionButton
                  to={ROUTES.PROJECTS_COMMITTEE.DISTRIBUTE_COMMITTEES}
                  icon={Users}
                  label={t('dashboard.committee.distributeCommittees')}
                />
                <QuickActionButton
                  to={ROUTES.PROJECTS_COMMITTEE.REPORTS}
                  icon={FileBarChart}
                  label={t('dashboard.committee.generateReports')}
                />
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </MainLayout>
  )
}


// Sub-components

function StatsCard({ title, value, icon: Icon, description, color, trend }: any) {
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

function TaskCard({ icon: Icon, title, count, description, actionLabel, actionLink, type, ArrowIcon }: any) {
  const styles = type === 'warning'
    ? "border-orange-200 bg-orange-50/50 dark:border-orange-900/50 dark:bg-orange-950/10 hover:border-orange-300 dark:hover:border-orange-800"
    : "border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/10 hover:border-blue-300 dark:hover:border-blue-800"; // Info/Blue for requests

  const iconStyle = type === 'warning' ? "text-orange-600 dark:text-orange-400" : "text-blue-600 dark:text-blue-400";
  const buttonStyle = type === 'warning' ? "hover:text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30" : "hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30";

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
