import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../layouts/MainLayout'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { ROUTES } from '../../lib/constants'
import { Link } from 'react-router-dom'
import {
  Users,
  Briefcase,
  FileText,
  Activity,
  TrendingUp,
  Database,
  Shield,
  Server,
  Settings,
  FileBarChart,
  AlertCircle,
  RefreshCw,
  MoreVertical,
  CheckCircle2
} from 'lucide-react'
import { StatsCard as StatsCardComponent, LoadingSpinner, BlockContent, DashboardHeader } from '@/components/common'
import { useAdminDashboard } from './hooks/useAdminDashboard'
import { useAuthStore } from '../../pages/auth/login'
import { cn } from '@/lib/utils'

export function AdminDashboardPage() {
  const { t } = useTranslation()
  const { data, isLoading, error, refetch } = useAdminDashboard()
  const { user } = useAuthStore()

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
  const systemHealth = data?.systemHealth || {
    status: 'unknown',
    databaseConnected: false,
    timestamp: new Date().toISOString(),
  }

  return (
    <MainLayout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCardComponent
            title={t('dashboard.admin.totalUsers')}
            value={stats.usersTotal}
            icon={Users}
            subValue={t('dashboard.admin.activeUsers', { count: stats.usersActive })}
            color="blue"
            trend={{ value: stats.usersActive, label: "new this week", positive: true }}
          />
          <StatsCardComponent
            title={t('dashboard.admin.projects')}
            value={stats.projectsTotal}
            icon={Briefcase}
            subValue={t('dashboard.admin.registeredProjects')}
            color="green"
            trend={{ value: stats.projectsTotal, label: "vs last month", positive: true }}
          />
          <StatsCardComponent
            title={t('dashboard.admin.proposals')}
            value={stats.proposalsTotal}
            icon={FileText}
            subValue={t('dashboard.admin.submittedProposals')}
            color="purple"
            trend={{ value: stats.proposalsTotal, label: "vs last month", positive: true }}
          />
          <StatsCardComponent
            title={t('dashboard.admin.systemStatus')}
            value={systemHealth.status === 'operational' ? t('dashboard.admin.operational', { defaultValue: 'Operational' }) : t('dashboard.admin.degraded', { defaultValue: 'Degraded' })}
            icon={Activity}
            subValue={systemHealth.databaseConnected ? t('dashboard.admin.allSystemsOperational') : t('dashboard.admin.databaseDisconnected', { defaultValue: 'Database disconnected' })}
            color={systemHealth.status === 'operational' ? 'green' : 'yellow'}
            trend={systemHealth.status === 'operational' ? { value: systemHealth.databaseConnected ? 100 : 0, label: "uptime", positive: true } : undefined}
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
                          <span className="text-sm font-medium capitalize">{role.replace('_', ' ')}</span>
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
                          <span className="text-sm font-medium capitalize">{status.replace('_', ' ')}</span>
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

            {/* System Health Status */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-semibold tracking-tight">{t('dashboard.admin.systemHealth', { defaultValue: 'System Health' })}</h2>
              </div>
              <Card className="border-border bg-card shadow-sm">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('dashboard.admin.databaseStatus', { defaultValue: 'Database' })}</span>
                      <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        systemHealth.databaseConnected
                          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      )}>
                        {systemHealth.databaseConnected
                          ? t('dashboard.admin.connected', { defaultValue: 'Connected' })
                          : t('dashboard.admin.disconnected', { defaultValue: 'Disconnected' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('dashboard.admin.lastChecked', { defaultValue: 'Last Checked' })}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(systemHealth.timestamp).toLocaleString()}
                      </span>
                    </div>
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
                  to="#"
                  icon={Settings}
                  label={t('dashboard.admin.systemSettings', { defaultValue: 'System Settings' })}
                  description={t('dashboard.admin.systemSettingsDesc', { defaultValue: 'Configure global options' })}
                  color="red"
                />
              </div>
            </Card>

            {/* System Health Status Detailed */}
            <Card className="border-border bg-card shadow-sm overflow-hidden">
              <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Server className="h-4 w-4 text-primary" />
                  {t('dashboard.admin.serverStatus', { defaultValue: 'Server Status' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-xs text-muted-foreground font-mono">12%</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[12%] rounded-full" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Memory</span>
                    <span className="text-xs text-muted-foreground font-mono">34%</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[34%] rounded-full" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Storage</span>
                    <span className="text-xs text-muted-foreground font-mono">45%</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[45%] rounded-full" />
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Last backup: 2 hours ago
                  </div>
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
        <div className={cn("mt-0.5 mr-3 p-1.5 rounded-md transition-colors", colorStyles[color])}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-left">
          <span className="font-medium block">{label}</span>
          {description && <span className="text-xs text-muted-foreground font-normal mt-0.5 block">{description}</span>}
        </div>
      </Link>
    </Button>
  )
}

