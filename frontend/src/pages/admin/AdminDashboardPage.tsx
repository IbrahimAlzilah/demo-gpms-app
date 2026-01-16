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
} from 'lucide-react'
import { StatsCard as StatsCardComponent, LoadingSpinner, BlockContent } from '@/components/common'
import { useAdminDashboard } from './hooks/useAdminDashboard'

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

  const stats = data.stats

  return (
    <MainLayout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCardComponent
            title={t('dashboard.admin.totalUsers')}
            value={stats.totalUsers}
            icon={Users}
            subValue={t('dashboard.admin.activeUsers', { count: stats.activeUsers })}
            color="blue"
          />
          <StatsCardComponent
            title={t('dashboard.admin.projects')}
            value={stats.totalProjects}
            icon={Briefcase}
            subValue={t('dashboard.admin.registeredProjects')}
            color="green"
          />
          <StatsCardComponent
            title={t('dashboard.admin.proposals')}
            value={stats.totalProposals}
            icon={FileText}
            subValue={t('dashboard.admin.submittedProposals')}
            color="purple"
          />
          <StatsCardComponent
            title={t('dashboard.admin.systemStatus')}
            value={stats.systemHealth}
            icon={Activity}
            subValue={t('dashboard.admin.allSystemsOperational')}
            color="yellow"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Area (2/3) */}
          <div className="lg:col-span-2 space-y-8">

            {/* System Overview Section */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="hover:border-primary/50 transition-colors shadow-none border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50 bg-muted/20">
                  <CardTitle className="text-base font-medium">
                    {t('dashboard.admin.userGrowth', { defaultValue: 'User Growth' })}
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <TrendingUp className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm font-medium">
                      {t('dashboard.admin.comingSoon', { defaultValue: 'Coming Soon' })}
                    </p>
                    <p className="text-xs mt-1">
                      {t('dashboard.admin.userGrowthDesc', { defaultValue: 'User growth analytics will be available soon.' })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/50 transition-colors shadow-none border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50 bg-muted/20">
                  <CardTitle className="text-base font-medium">
                    {t('dashboard.admin.storageUsage', { defaultValue: 'Storage Usage' })}
                  </CardTitle>
                  <Database className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <Database className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm font-medium">
                      {t('dashboard.admin.comingSoon', { defaultValue: 'Coming Soon' })}
                    </p>
                    <p className="text-xs mt-1">
                      {t('dashboard.admin.storageUsageDesc', { defaultValue: 'Storage usage metrics will be available soon.' })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent System Alerts - Clean List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold tracking-tight">{t('dashboard.admin.recentAlerts', { defaultValue: 'Recent System Alerts' })}</h2>
              </div>
              <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                <div className="bg-muted inline-flex p-3 rounded-full mb-3">
                  <Shield className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">{t('dashboard.admin.noAlerts', { defaultValue: 'System is running smoothly. No critical alerts.' })}</p>
              </div>
            </div>

          </div>

          {/* Sidebar Area (1/3) */}
          <div className="space-y-8">

            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold tracking-tight">{t('dashboard.admin.quickActions')}</h3>
              <div className="grid grid-cols-1 gap-2">
                <QuickActionButton
                  to={ROUTES.ADMIN.USERS}
                  icon={Users}
                  label={t('dashboard.admin.manageUsers')}
                />
                <QuickActionButton
                  to={ROUTES.ADMIN.REPORTS}
                  icon={FileBarChart}
                  label={t('dashboard.admin.generateReports')}
                />
                <QuickActionButton
                  to="#"
                  icon={Settings}
                  label={t('dashboard.admin.systemSettings', { defaultValue: 'System Settings' })}
                />
              </div>
            </div>

            {/* System Health Status Detailed */}
            <Card className="border-border bg-card shadow-none overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Server className="h-4 w-4 text-primary" />
                  {t('dashboard.admin.serverStatus', { defaultValue: 'Server Status' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                  <Server className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm font-medium">
                    {t('dashboard.admin.comingSoon', { defaultValue: 'Coming Soon' })}
                  </p>
                  <p className="text-xs mt-1">
                    {t('dashboard.admin.serverStatusDesc', { defaultValue: 'Server status monitoring will be available soon.' })}
                  </p>
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
}

function QuickActionButton({ to, icon: Icon, label }: QuickActionButtonProps) {
  return (
    <Button asChild variant="outline" className="w-full justify-start h-11 px-4 bg-card hover:bg-accent hover:text-accent-foreground border-border shadow-none transition-all duration-200">
      <Link to={to} className="flex items-center">
        <Icon className="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="font-medium">{label}</span>
      </Link>
    </Button>
  )
}

