import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../../layouts/MainLayout'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { ROUTES } from '../../../lib/constants'
import { Link } from 'react-router-dom'
import { Briefcase, ClipboardCheck } from 'lucide-react'

export function DiscussionCommitteeDashboardPage() {
  const { t } = useTranslation()

  // Mock data - in real app, fetch from API
  const stats = {
    assignedProjects: 8,
    pendingEvaluations: 5,
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.discussion.assignedProjects')}</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assignedProjects}</div>
              <p className="text-xs text-muted-foreground">{t('dashboard.discussion.assignedToCommittee')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.discussion.pendingEvaluations')}</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingEvaluations}</div>
              <p className="text-xs text-muted-foreground">{t('dashboard.discussion.awaitingReview')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.discussion.quickActions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to={ROUTES.DISCUSSION_COMMITTEE.PROJECTS}>
                <Briefcase className="ml-2 h-4 w-4" />
                {t('dashboard.discussion.viewProjects')}
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to={ROUTES.DISCUSSION_COMMITTEE.EVALUATION}>
                <ClipboardCheck className="ml-2 h-4 w-4" />
                {t('dashboard.discussion.finalEvaluation')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
