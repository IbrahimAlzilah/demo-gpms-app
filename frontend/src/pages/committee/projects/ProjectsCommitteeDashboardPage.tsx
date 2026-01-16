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
  ArrowRight,
  Clock,
} from 'lucide-react'
import { StatsCard as StatsCardComponent } from '@/components/common'
import { cn } from '@/lib/utils'

export function ProjectsCommitteeDashboardPage() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'

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
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('dashboard.welcome', { defaultValue: 'Projects Committee' })}</h1>
          <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCardComponent
            title={t('dashboard.committee.proposals')}
            value={stats.pendingProposals}
            icon={FileText}
            subValue={t('dashboard.committee.pendingReview')}
            color="blue"
          />
          <StatsCardComponent
            title={t('dashboard.committee.requests')}
            value={stats.pendingRequests}
            icon={FileCheck}
            subValue={t('dashboard.committee.pendingRequests')}
            color="yellow"
          />
          <StatsCardComponent
            title={t('dashboard.committee.projects')}
            value={stats.projectsToAnnounce}
            icon={Megaphone}
            subValue={t('dashboard.committee.projectsToAnnounce')}
            color="green"
          />
          <StatsCardComponent
            title={t('dashboard.committee.supervisors')}
            value={stats.supervisorsToAssign}
            icon={UserPlus}
            subValue={t('dashboard.committee.projectsNeedSupervisors')}
            color="green"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Area (2/3) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Urgent Tasks Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight">{t('dashboard.committee.urgentTasks')}</h2>

              <div className="grid gap-3">
                {stats.pendingProposals > 0 && (
                  <TaskRow
                    icon={FileText}
                    title={t('dashboard.committee.proposalsToReview', { count: stats.pendingProposals })}
                    description={t('dashboard.committee.reviewProposalsDesc', { defaultValue: 'New proposals are waiting for your review.' })}
                    actionLabel={t('dashboard.committee.review')}
                    actionLink={ROUTES.PROJECTS_COMMITTEE.PROPOSALS}
                    type="warning"
                    ArrowIcon={ArrowIcon}
                  />
                )}

                {stats.pendingRequests > 0 && (
                  <TaskRow
                    icon={FileCheck}
                    title={t('dashboard.committee.requestsToProcess', { count: stats.pendingRequests })}
                    description={t('dashboard.committee.processRequestsDesc', { defaultValue: 'Student requests require committee approval.' })}
                    actionLabel={t('dashboard.committee.process')}
                    actionLink={ROUTES.PROJECTS_COMMITTEE.REQUESTS}
                    type="info"
                    ArrowIcon={ArrowIcon}
                  />
                )}

                {/* Example of empty state if no urgent tasks */}
                {stats.pendingProposals === 0 && stats.pendingRequests === 0 && (
                  <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-muted-foreground/25 bg-muted/5">
                    <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full mb-4">
                      <FileCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold">{t('dashboard.committee.allCaughtUp', { defaultValue: 'All caught up!' })}</h3>
                  </div>
                )}
              </div>
            </div>

            {/* Workflow Timeline Placeholder */}
            <Card className="overflow-hidden border-border bg-card shadow-none">
              <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
                <CardTitle className="text-base font-medium">{t('dashboard.committee.currentPhase', { defaultValue: 'Current Phase' })}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 rounded-md text-primary">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-foreground">{t('phase.proposalSubmission', { defaultValue: 'Proposal Submission' })}</span>
                    </div>
                    <span className="text-muted-foreground bg-secondary px-2 py-0.5 rounded text-xs">{t('common.endsIn', { defaultValue: 'Ends in 3 days' })}</span>
                  </div>

                  <div className="relative pt-2">
                    <div className="flex mb-2 items-center justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>75% Complete</span>
                      <span>100%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[75%]" />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground border-t border-border/50 pt-4 mt-2">
                    <span className="font-semibold">{t('common.next', { defaultValue: 'Next' })}:</span> {t('phase.nextPhase', { defaultValue: 'Project Announcement' })}
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar Area (1/3) */}
          <div className="space-y-8">

            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold tracking-tight">{t('dashboard.committee.quickActions')}</h3>
              <div className="grid grid-cols-1 gap-2">
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
              </div>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  )
}


// Sub-components

function TaskRow({ icon: Icon, title, description, actionLabel, actionLink, type, ArrowIcon }: any) {
  const typeStyles = type === 'warning'
    ? { icon: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400", border: 'hover:border-orange-200' }
    : { icon: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400", border: 'hover:border-blue-200' };

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
