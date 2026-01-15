import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../layouts/MainLayout'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { ROUTES } from '../../lib/constants'
import { Link } from 'react-router-dom'
import {
  Users,
  FileBarChart,
  Settings,
  Shield,
  Activity,
  Server,
  Database,
  Briefcase,
  FileText,
  ArrowLeft,
  ArrowRight,
  TrendingDown,
  TrendingUp
} from 'lucide-react'
import { useAuthStore } from '@/pages/auth/login'
import { cn } from '@/lib/utils'

export function AdminDashboardPage() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.dir() === 'rtl'
  const { user } = useAuthStore()

  // Mock data - in real app, fetch from API
  const stats = {
    totalUsers: 150,
    activeUsers: 120,
    totalProjects: 45,
    totalProposals: 78,
    systemHealth: 'Good'
  }

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight

  return (
    <MainLayout>
      <div className="space-y-8 animate-in fade-in duration-700 pb-10">

        {/* Welcome Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('dashboard.welcome', { defaultValue: 'System Administration' })}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('dashboard.admin.subtitle', { defaultValue: 'Monitor system usage, manage users, and generate reports.' })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title={t('dashboard.admin.totalUsers')}
            value={stats.totalUsers}
            icon={Users}
            description={t('dashboard.admin.activeUsers', { count: stats.activeUsers })}
            color="blue"
          />
          <StatsCard
            title={t('dashboard.admin.projects')}
            value={stats.totalProjects}
            icon={Briefcase}
            description={t('dashboard.admin.registeredProjects')}
            color="green"
            trend="positive"
          />
          <StatsCard
            title={t('dashboard.admin.proposals')}
            value={stats.totalProposals}
            icon={FileText}
            description={t('dashboard.admin.submittedProposals')}
            color="orange"
          />
          <StatsCard
            title={t('dashboard.admin.systemStatus')}
            value={stats.systemHealth}
            icon={Activity}
            description={t('dashboard.admin.allSystemsOperational')}
            color="slate"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content Area (2/3) */}
          <div className="lg:col-span-2 space-y-8">

            {/* System Overview Section - Placeholder for charts/graphs */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-medium">
                    {t('dashboard.admin.userGrowth', { defaultValue: 'User Growth' })}
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+12%</div>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.admin.sinceLastMonth', { defaultValue: 'from last month' })}
                  </p>
                  <div className="h-[80px] w-full bg-gradient-to-t from-primary/10 to-transparent mt-4 rounded-md border border-dashed flex items-end justify-center pb-2 text-xs text-muted-foreground">
                    [Chart Placeholder]
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-medium">
                    {t('dashboard.admin.storageUsage', { defaultValue: 'Storage Usage' })}
                  </CardTitle>
                  <Database className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45%</div>
                  <p className="text-xs text-muted-foreground">
                    2.1 TB / 5 TB
                  </p>
                  <div className="h-2 w-full bg-secondary mt-4 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[45%]" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent System Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.admin.recentAlerts', { defaultValue: 'Recent System Alerts' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <Shield className="h-12 w-12 text-muted-foreground/20 mb-3" />
                  <p>{t('dashboard.admin.noAlerts', { defaultValue: 'No critical security alerts.' })}</p>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar Area (1/3) */}
          <div className="space-y-8">

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.admin.quickActions')}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
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
              </CardContent>
            </Card>

            {/* System Health Status Detailed */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  {t('dashboard.admin.serverStatus', { defaultValue: 'Server Status' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Server</span>
                  <StatusDot status="online" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Database Node 1</span>
                  <StatusDot status="online" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Storage Service</span>
                  <StatusDot status="online" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email Gateway</span>
                  <StatusDot status="maintenance" />
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
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
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
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {trend === 'positive' && <TrendingUp className="h-3 w-3 text-green-500" />}
            {trend === 'negative' && <TrendingDown className="h-3 w-3 text-red-500" />}
            {description}
          </p>
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

function StatusDot({ status }: { status: 'online' | 'offline' | 'maintenance' }) {
  const styles = {
    online: "bg-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.2)]",
    offline: "bg-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]",
    maintenance: "bg-amber-500 shadow-[0_0_0_2px_rgba(245,158,11,0.2)]",
  }

  return (
    <div className="flex items-center gap-2">
      <span className={cn("h-2.5 w-2.5 rounded-full", styles[status])} />
      <span className="text-xs text-muted-foreground capitalize">{status}</span>
    </div>
  )
}
