import { MainLayout } from '@/layouts/MainLayout'
import { ROUTES } from '@/lib/constants'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import {
  Briefcase,
  UserCheck,
  ClipboardCheck,
  Calendar,
  ArrowLeft,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function SupervisorDashboardPage() {
  const { t } = useTranslation()

  // Mock data - in real app, fetch from API
  const stats = {
    projects: 5,
    pendingRequests: 3,
    upcomingMeetings: 2,
    pendingEvaluations: 4,
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('nav.projects')}</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.projects}</div>
              <p className="text-xs text-muted-foreground">{t('supervisor.projectsUnderSupervision')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('nav.supervisionRequests')}</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">{t('supervisor.pendingRequests')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('nav.meetings')}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingMeetings}</div>
              <p className="text-xs text-muted-foreground">{t('supervisor.upcomingMeetings')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('nav.evaluations')}</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingEvaluations}</div>
              <p className="text-xs text-muted-foreground">{t('supervisor.pendingEvaluations')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('supervisor.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={ROUTES.SUPERVISOR.SUPERVISION_REQUESTS}>
                  <UserCheck className="ml-2 h-4 w-4" />
                  {t('nav.supervisionRequests')}
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={ROUTES.SUPERVISOR.PROJECTS}>
                  <Briefcase className="ml-2 h-4 w-4" />
                  {t('nav.projects')}
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={ROUTES.SUPERVISOR.PROGRESS}>
                  <Calendar className="ml-2 h-4 w-4" />
                  {t('nav.progress')}
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={ROUTES.SUPERVISOR.EVALUATION}>
                  <ClipboardCheck className="ml-2 h-4 w-4" />
                  {t('nav.evaluations')}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('supervisor.urgentTasks')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.pendingRequests > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10">
                    <span className="text-sm">{t('supervisor.youHave')} {stats.pendingRequests} {t('supervisor.pendingRequests')}</span>
                    <Button asChild size="sm" variant="outline">
                      <Link to={ROUTES.SUPERVISOR.SUPERVISION_REQUESTS}>
                        {t('supervisor.review')}
                        <ArrowLeft className="mr-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                )}
                {stats.pendingEvaluations > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-info/10">
                    <span className="text-sm">{t('supervisor.youHave')} {stats.pendingEvaluations} {t('supervisor.pendingEvaluations')}</span>
                    <Button asChild size="sm" variant="outline">
                      <Link to={ROUTES.SUPERVISOR.EVALUATION}>
                        {t('nav.evaluations')}
                        <ArrowLeft className="mr-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
