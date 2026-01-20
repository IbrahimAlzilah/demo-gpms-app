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
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  Hourglass
} from 'lucide-react'
import { StatsCard as StatsCardComponent, LoadingSpinner, BlockContent, DashboardHeader } from '@/components/common'
import { cn } from '@/lib/utils'
import { useProjectsCommitteeDashboard } from './hooks/useProjectsCommitteeDashboard'
import type { PeriodType } from '@/types/period.types'
import { useAuthStore } from '../../../pages/auth/login'

export function ProjectsCommitteeDashboardPage() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  const { data, isLoading, error, refetch } = useProjectsCommitteeDashboard()
  const { user } = useAuthStore()

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  // Helper function to get period type label
  const getPeriodTypeLabel = (type: PeriodType): string => {
    const labels: Record<PeriodType, string> = {
      proposal_submission: t('phase.proposalSubmission', { defaultValue: 'Proposal Submission' }),
      project_registration: t('phase.projectRegistration', { defaultValue: 'Project Registration' }),
      document_submission: t('phase.documentSubmission', { defaultValue: 'Document Submission' }),
      supervisor_evaluation: t('phase.supervisorEvaluation', { defaultValue: 'Supervisor Evaluation' }),
      committee_evaluation: t('phase.committeeEvaluation', { defaultValue: 'Committee Evaluation' }),
      discussion_evaluation: t('phase.discussionEvaluation', { defaultValue: 'Discussion Evaluation' }),
      final_discussion: t('phase.finalDiscussion', { defaultValue: 'Final Discussion' }),
      grade_approval: t('phase.gradeApproval', { defaultValue: 'Grade Approval' }),
      general: t('phase.general', { defaultValue: 'General' }),
    }
    return labels[type] || type
  }

  // Helper function to format "Ends in X days"
  const formatEndsIn = (days: number | null): string => {
    if (days === null) return ''
    if (days === 0) return t('common.endsToday', { defaultValue: 'Ends today' })
    if (days === 1) return t('common.endsTomorrow', { defaultValue: 'Ends tomorrow' })
    return t('common.endsInDays', { count: days, defaultValue: `Ends in ${days} days` })
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
                  {error.message || t('dashboard.committee.loadError', { defaultValue: 'Failed to load dashboard data.' })}
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
    pendingProposals: 0,
    pendingRequests: 0,
    draftProjectsToAnnounce: 0,
    projectsWithoutSupervisor: 0,
    pendingRegistrations: 0,
    gradesPendingApproval: 0,
  }
  const currentPhase = data?.currentPhase || {
    period: null,
    progressPercent: 0,
    endsInDays: null,
    nextPeriod: null,
  }

  return (
    <MainLayout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCardComponent
            title={t('dashboard.committee.proposals')}
            value={stats.pendingProposals}
            icon={FileText}
            subValue={t('dashboard.committee.pendingReview')}
            color="blue"
            trend={stats.pendingProposals > 10 ? { value: stats.pendingProposals, label: "high load", positive: false } : undefined}
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
            value={stats.draftProjectsToAnnounce}
            icon={Megaphone}
            subValue={t('dashboard.committee.projectsToAnnounce')}
            color="purple"
          />
          <StatsCardComponent
            title={t('dashboard.committee.supervisors')}
            value={stats.projectsWithoutSupervisor}
            icon={UserPlus}
            subValue={t('dashboard.committee.projectsNeedSupervisors')}
            color="green"
            trend={stats.projectsWithoutSupervisor > 0 ? { value: stats.projectsWithoutSupervisor, label: "unassigned", positive: false } : { value: 100, label: "assigned", positive: true }}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Area (2/3) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Current Phase Card - Hero Element */}
            <Card className="overflow-hidden border-border bg-gradient-to-br from-card to-card/50 shadow-sm relative">
              <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <CardHeader className="border-b border-border/40 bg-muted/10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    {t('dashboard.committee.currentPhase', { defaultValue: 'Current Phase' })}
                  </CardTitle>
                  {currentPhase.period && (
                    <div className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                      currentPhase.period.isActive ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" : "bg-muted text-muted-foreground"
                    )}>
                      {currentPhase.period.isActive ? "Active Now" : "Scheduled"}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-8 pb-8 relative z-10">
                {currentPhase.period ? (
                  <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-bold tracking-tight mb-1">
                          {currentPhase.period.name || getPeriodTypeLabel(currentPhase.period.type)}
                        </h3>
                        <p className="text-muted-foreground">
                          {new Date(currentPhase.period.startDate).toLocaleDateString()} - {new Date(currentPhase.period.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">
                          {currentPhase.endsInDays !== null ? currentPhase.endsInDays : '-'} <span className="text-sm font-normal text-muted-foreground">days left</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span>Progress</span>
                        <span>{currentPhase.progressPercent}%</span>
                      </div>
                      <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-1000 ease-out relative group"
                          style={{ width: `${Math.min(100, Math.max(0, currentPhase.progressPercent))}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors"></div>
                        </div>
                      </div>
                    </div>

                    {currentPhase.nextPeriod && (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/50">
                        <div className="p-2 rounded-full bg-background border shadow-sm">
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">{t('common.next', { defaultValue: 'Up Next' })}</p>
                          <p className="font-medium text-sm">{currentPhase.nextPeriod.name || getPeriodTypeLabel(currentPhase.nextPeriod.type)}</p>
                        </div>
                        <div className="ml-auto text-xs text-muted-foreground bg-background px-2 py-1 rounded border">
                          Starts {new Date(currentPhase.nextPeriod.startDate).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="p-4 rounded-full bg-muted mb-4 animate-pulse">
                      <Clock className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{t('dashboard.committee.noActivePhase', { defaultValue: 'No active phase' })}</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      There is no active phase currently. Check the schedule to manage upcoming periods.
                    </p>
                    <Button className="mt-4" variant="outline" asChild>
                      <Link to={ROUTES.PROJECTS_COMMITTEE.PERIODS}>{t('dashboard.committee.managePeriods')}</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Urgent Tasks Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Hourglass className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold tracking-tight">{t('dashboard.committee.urgentTasks')}</h2>
              </div>

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

                {stats.draftProjectsToAnnounce > 0 && (
                  <TaskRow
                    icon={Megaphone}
                    title={t('dashboard.committee.projectsToAnnounceCount', { count: stats.draftProjectsToAnnounce, defaultValue: `${stats.draftProjectsToAnnounce} Projects to Announce` })}
                    description={t('dashboard.committee.announceProjectsDesc', { defaultValue: 'Draft projects ready for announcement.' })}
                    actionLabel={t('dashboard.committee.announce')}
                    actionLink={ROUTES.PROJECTS_COMMITTEE.ANNOUNCE_PROJECTS}
                    type="success"
                    ArrowIcon={ArrowIcon}
                  />
                )}

                {/* Empty state if no urgent tasks */}
                {stats.pendingProposals === 0 && stats.pendingRequests === 0 && stats.draftProjectsToAnnounce === 0 && (
                  <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-primary/20 bg-primary/5">
                    <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full mb-4 ring-4 ring-white dark:ring-background shadow-sm">
                      <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold">{t('dashboard.committee.allCaughtUp', { defaultValue: 'All caught up!' })}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      No pending items requiring immediate attention.
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
              <h3 className="text-base font-semibold tracking-tight">{t('dashboard.committee.quickActions')}</h3>
              <div className="grid grid-cols-1 gap-2">
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
    ? { icon: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400", border: 'group-hover:border-amber-200' }
    : type === 'info'
      ? { icon: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400", border: 'group-hover:border-blue-200' }
      : { icon: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400", border: 'group-hover:border-green-200' };

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
      <Button asChild variant="ghost" size="sm" className="shrink-0 w-full sm:w-auto border border-border/50 bg-background/50 hover:bg-background">
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
