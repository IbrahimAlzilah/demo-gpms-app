import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../layouts/MainLayout'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { ROUTES } from '../../lib/constants'
import { Link } from 'react-router-dom'
import { Users, FileBarChart } from 'lucide-react'

export function AdminDashboardPage() {
  const { t } = useTranslation()

  // Mock data - in real app, fetch from API
  const stats = {
    totalUsers: 150,
    activeUsers: 120,
    totalProjects: 45,
    totalProposals: 78,
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.admin.totalUsers')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">{t('dashboard.admin.activeUsers', { count: stats.activeUsers })}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.admin.projects')}</CardTitle>
              <FileBarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">{t('dashboard.admin.registeredProjects')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.admin.proposals')}</CardTitle>
              <FileBarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProposals}</div>
              <p className="text-xs text-muted-foreground">{t('dashboard.admin.submittedProposals')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.admin.systemStatus')}</CardTitle>
              <FileBarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{t('dashboard.admin.stable')}</div>
              <p className="text-xs text-muted-foreground">{t('dashboard.admin.allSystemsOperational')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.admin.quickActions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to={ROUTES.ADMIN.USERS}>
                <Users className="ml-2 h-4 w-4" />
                {t('dashboard.admin.manageUsers')}
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to={ROUTES.ADMIN.REPORTS}>
                <FileBarChart className="ml-2 h-4 w-4" />
                {t('dashboard.admin.generateReports')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
