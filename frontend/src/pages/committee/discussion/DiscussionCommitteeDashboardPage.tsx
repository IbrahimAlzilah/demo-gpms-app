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
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/pages/auth/login'

export function DiscussionCommitteeDashboardPage() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  const { user } = useAuthStore()

  // Mock data - in real app, fetch from API
  const stats = {
    assignedProjects: 8,
    pendingEvaluations: 5,
    completedEvaluations: 12,
    upcomingDefenses: 3
  }

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

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
                {stats.pendingEvaluations > 0 ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="group flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:bg-accent/5 hover:border-primary/20">
                      <div className="flex items-start gap-3 w-full sm:w-auto">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 shrink-0">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm group-hover:text-primary transition-colors">Smart City Traffic System {i + 1}</h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                            <Clock className="h-3 w-3" />
                            {t('common.daysAgo', { count: i + 2, defaultValue: `${i + 2} days ago` })}
                          </p>
                        </div>
                      </div>
                      <Button asChild size="sm" variant="ghost" className="shrink-0 w-full sm:w-auto">
                        <Link to={ROUTES.DISCUSSION_COMMITTEE.EVALUATION}>
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
                  <div className="relative border-l-2 border-primary/20 pl-4 ml-2 space-y-6">
                    <div className="relative">
                      <span className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-card" />
                      <p className="text-sm font-medium">Group A - AI Research</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> Today, 10:00 AM
                      </p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full bg-muted-foreground/30 ring-4 ring-card" />
                      <p className="text-sm font-medium text-muted-foreground">Group B - Robotics</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> Tomorrow, 02:00 PM
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full h-8 text-xs">
                    {t('common.viewFullSchedule', { defaultValue: 'View Full Schedule' })}
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
