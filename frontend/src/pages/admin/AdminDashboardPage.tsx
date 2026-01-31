import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../layouts/MainLayout'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { ROUTES } from '../../lib/constants'
import { Link } from 'react-router-dom'
import {
  Users,
  Briefcase,
  FileText,
  Settings,
  FileBarChart,
  AlertCircle,
  RefreshCw,
  MoreVertical,
} from 'lucide-react'
import { StatsCard as StatsCardComponent, LoadingSpinner, BlockContent } from '@/components/common'
import { useAdminDashboard } from './hooks/useAdminDashboard'
import { cn } from '@/lib/utils'

export function AdminDashboardPage() {
  const { t } = useTranslation()
  const { data, isLoading, error, refetch } = useAdminDashboard()

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
                  {error.message || t('dashboard.admin.loadError', { defaultValue: 'Failed to load dashboard data.' })}
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
    usersTotal: 0,
    usersActive: 0,
    usersByRole: {},
    projectsTotal: 0,
    projectsByStatus: {},
    proposalsTotal: 0,
    proposalsByStatus: {},
    requestsTotal: 0,
    requestsByStatus: {},
  }
  return (
    <MainLayout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatsCardComponent
            title={t('dashboard.admin.totalUsers')}
            value={stats.usersTotal}
            icon={Users}
            subValue={t('dashboard.admin.activeUsers', { count: stats.usersActive })}
            color="blue"
          />
          <StatsCardComponent
            title={t('dashboard.admin.projects')}
            value={stats.projectsTotal}
            icon={Briefcase}
            subValue={t('dashboard.admin.registeredProjects')}
            color="green"
          />
          <StatsCardComponent
            title={t('dashboard.admin.proposals')}
            value={stats.proposalsTotal}
            icon={FileText}
            subValue={t('dashboard.admin.submittedProposals')}
            color="purple"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Area (2/3) */}
          <div className="lg:col-span-2 space-y-8">

            {/* System Overview Section - Placeholder Grids that look nicer */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-sm border-border bg-card overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/40 bg-muted/10">
                  <CardTitle className="text-base font-medium">
                    {t('dashboard.admin.usersByRole', { defaultValue: 'Users by Role' })}
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {Object.entries(stats.usersByRole).length > 0 ? (
                      Object.entries(stats.usersByRole).map(([role, count]) => (
                        <div key={role} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{t(`roles.${role}`) || role}</span>
                          <span className="text-sm text-muted-foreground">{count as number}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">{t('dashboard.admin.noData', { defaultValue: 'No data available' })}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border bg-card overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/40 bg-muted/10">
                  <CardTitle className="text-base font-medium">
                    {t('dashboard.admin.projectsByStatus', { defaultValue: 'Projects by Status' })}
                  </CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {Object.entries(stats.projectsByStatus).length > 0 ? (
                      Object.entries(stats.projectsByStatus).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{t(`status.${status}`) || status}</span>
                          <span className="text-sm text-muted-foreground">{count as number}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">{t('dashboard.admin.noData', { defaultValue: 'No data available' })}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>

          {/* Sidebar Area (1/3) */}
          <div className="space-y-8">

            {/* Quick Actions */}
            <Card className="border-none shadow-none bg-transparent">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1 rounded bg-primary/10">
                  <MoreVertical className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-base font-semibold tracking-tight">{t('dashboard.admin.quickActions')}</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <QuickActionButton
                  to={ROUTES.ADMIN.USERS}
                  icon={Users}
                  label={t('dashboard.admin.manageUsers')}
                  description={t('dashboard.admin.manageUsersDesc', { defaultValue: 'Add, edit, or remove users' })}
                  color="blue"
                />
                <QuickActionButton
                  to={ROUTES.ADMIN.REPORTS}
                  icon={FileBarChart}
                  label={t('dashboard.admin.generateReports')}
                  description={t('dashboard.admin.generateReportsDesc', { defaultValue: 'View system analytics' })}
                  color="green"
                />
                <QuickActionButton
                  to={ROUTES.ADMIN.SETTINGS}
                  icon={Settings}
                  label={t('dashboard.admin.systemSettings', { defaultValue: 'System Settings' })}
                  description={t('dashboard.admin.systemSettingsDesc', { defaultValue: 'Configure global options' })}
                  color="red"
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
  icon: React.ComponentType<{ className?: string }>
  label: string
  description?: string
  color?: 'blue' | 'green' | 'red'
}

function QuickActionButton({ to, icon: Icon, label, description, color = 'blue' }: QuickActionButtonProps) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30",
    green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-900/30",
    red: "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/30",
  }

  return (
    <Button asChild variant="outline" className="w-full justify-start h-auto py-3 px-4 bg-card hover:bg-accent hover:text-accent-foreground border-border shadow-none transition-all duration-200 group">
      <Link to={to} className="flex items-start">
        <div className={cn("mt-0.5 me-1 p-1.5 rounded-md transition-colors", colorStyles[color])}>
          <Icon className="size-4" />
        </div>
        <div className="text-start">
          <span className="font-medium block">{label}</span>
          {description && <span className="text-xs text-muted-foreground font-normal mt-0.5 block">{description}</span>}
        </div>
      </Link>
    </Button>
  )
}

