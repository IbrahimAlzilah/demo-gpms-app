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
      <div className="space-y-8 animate-in fade-in duration-700 pb-10">

        {/* Welcome Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('dashboard.welcome', { defaultValue: 'Discussion Committee' })}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('dashboard.discussion.subtitle', { defaultValue: 'Evaluate student projects and conduct final defenses.' })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title={t('dashboard.discussion.assignedProjects')}
            value={stats.assignedProjects}
            icon={Briefcase}
            description={t('dashboard.discussion.assignedToCommittee')}
            color="blue"
          />
          <StatsCard
            title={t('dashboard.discussion.pendingEvaluations')}
            value={stats.pendingEvaluations}
            icon={ClipboardCheck}
            description={t('dashboard.discussion.awaitingReview')}
            color="orange"
            trend={stats.pendingEvaluations > 0 ? 'warning' : 'neutral'}
          />
          <StatsCard
            title={t('dashboard.discussion.upcomingDefenses', { defaultValue: 'Upcoming Defenses' })}
            value={stats.upcomingDefenses}
            icon={Calendar}
            description={t('dashboard.discussion.scheduledThisWeek', { defaultValue: 'Scheduled this week' })}
            color="purple"
          />
          <StatsCard
            title={t('dashboard.discussion.completed', { defaultValue: 'Completed' })}
            value={stats.completedEvaluations}
            icon={CheckCircle2}
            description={t('dashboard.discussion.totalEvaluated', { defaultValue: 'Total projects evaluated' })}
            color="green"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Area (2/3) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Urgent Tasks Section / Pending Evaluations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">{t('dashboard.discussion.pendingEvaluations')}</h2>
              </div>

              <div className="grid gap-4">
                {stats.pendingEvaluations > 0 ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="group hover:border-primary/50 transition-all duration-300">
                      <CardContent className="p-5 flex items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-secondary/50 rounded-lg group-hover:bg-primary/10 transition-colors">
                            <Briefcase className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold group-hover:text-primary transition-colors">Smart City Traffic System {i + 1}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                              <Clock className="h-3 w-3" />
                              {t('common.daysAgo', { count: i + 2, defaultValue: `${i + 2} days ago` })}
                            </p>
                          </div>
                        </div>
                        <Button asChild size="sm">
                          <Link to={ROUTES.DISCUSSION_COMMITTEE.EVALUATION}>
                            {t('dashboard.discussion.evaluate', { defaultValue: 'Evaluate' })}
                            <ArrowIcon className="ms-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full mb-4">
                        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="font-semibold">{t('dashboard.discussion.allCaughtUp', { defaultValue: 'All evaluations complete!' })}</h3>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar Area (1/3) */}
          <div className="space-y-8">

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.discussion.quickActions')}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
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
              </CardContent>
            </Card>

            {/* Defense Schedule Widget */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="border-b border-primary/10 bg-primary/10 pb-4">
                <CardTitle className="text-primary flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  {t('dashboard.discussion.defenseSchedule', { defaultValue: 'Defense Schedule' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="relative border-l-2 border-primary/20 pl-4 ml-2 space-y-6">
                    <div className="relative">
                      <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                      <p className="text-sm font-medium">Group A - AI Research</p>
                      <p className="text-xs text-muted-foreground">Today, 10:00 AM</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-muted-foreground/30 ring-4 ring-background" />
                      <p className="text-sm font-medium">Group B - Robotics</p>
                      <p className="text-xs text-muted-foreground">Tomorrow, 02:00 PM</p>
                    </div>
                  </div>
                  <Button variant="link" className="w-full h-auto p-0 text-primary text-xs">
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
