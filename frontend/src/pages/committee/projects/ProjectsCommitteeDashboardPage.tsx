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
} from 'lucide-react'

export function ProjectsCommitteeDashboardPage() {
  const { t } = useTranslation()

  // Mock data - in real app, fetch from API
  const stats = {
    pendingProposals: 12,
    pendingRequests: 8,
    projectsToAnnounce: 5,
    supervisorsToAssign: 3,
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.committee.proposals')}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingProposals}</div>
              <p className="text-xs text-muted-foreground">{t('dashboard.committee.pendingReview')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.committee.requests')}</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">{t('dashboard.committee.pendingRequests')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.committee.projects')}</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.projectsToAnnounce}</div>
              <p className="text-xs text-muted-foreground">{t('dashboard.committee.projectsToAnnounce')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.committee.supervisors')}</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.supervisorsToAssign}</div>
              <p className="text-xs text-muted-foreground">{t('dashboard.committee.projectsNeedSupervisors')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.committee.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={ROUTES.PROJECTS_COMMITTEE.PERIODS}>
                  <Calendar className="ml-2 h-4 w-4" />
                  {t('dashboard.committee.announcePeriods')}
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={ROUTES.PROJECTS_COMMITTEE.PROPOSALS}>
                  <FileText className="ml-2 h-4 w-4" />
                  {t('dashboard.committee.manageProposals')}
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={ROUTES.PROJECTS_COMMITTEE.ANNOUNCE_PROJECTS}>
                  <Megaphone className="ml-2 h-4 w-4" />
                  {t('dashboard.committee.announceProjects')}
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={ROUTES.PROJECTS_COMMITTEE.ASSIGN_SUPERVISORS}>
                  <UserPlus className="ml-2 h-4 w-4" />
                  {t('dashboard.committee.assignSupervisors')}
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={ROUTES.PROJECTS_COMMITTEE.REQUESTS}>
                  <FileCheck className="ml-2 h-4 w-4" />
                  {t('dashboard.committee.processRequests')}
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={ROUTES.PROJECTS_COMMITTEE.DISTRIBUTE_COMMITTEES}>
                  <Users className="ml-2 h-4 w-4" />
                  {t('dashboard.committee.distributeCommittees')}
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to={ROUTES.PROJECTS_COMMITTEE.REPORTS}>
                  <FileBarChart className="ml-2 h-4 w-4" />
                  {t('dashboard.committee.generateReports')}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.committee.urgentTasks')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.pendingProposals > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10">
                    <span className="text-sm">{t('dashboard.committee.proposalsToReview', { count: stats.pendingProposals })}</span>
                    <Button asChild size="sm" variant="outline">
                      <Link to={ROUTES.PROJECTS_COMMITTEE.PROPOSALS}>
                        {t('dashboard.committee.review')}
                        <ArrowLeft className="mr-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                )}
                {stats.pendingRequests > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-info/10">
                    <span className="text-sm">{t('dashboard.committee.requestsToProcess', { count: stats.pendingRequests })}</span>
                    <Button asChild size="sm" variant="outline">
                      <Link to={ROUTES.PROJECTS_COMMITTEE.REQUESTS}>
                        {t('dashboard.committee.process')}
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
