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
  ArrowLeft,
  ArrowRight
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
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-start">System Administration</h1>
          <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title={t('dashboard.admin.totalUsers')}
            value={stats.totalUsers}
            icon={Users}
            subValue={t('dashboard.admin.activeUsers', { count: stats.activeUsers })}
            color="blue"
          />
          <StatsCard
            title={t('dashboard.admin.projects')}
            value={stats.totalProjects}
            icon={Briefcase}
            subValue={t('dashboard.admin.registeredProjects')}
            color="green"
          />
          <StatsCard
            title={t('dashboard.admin.proposals')}
            value={stats.totalProposals}
            icon={FileText}
            subValue={t('dashboard.admin.submittedProposals')}
            color="orange"
          />
          <StatsCard
            title={t('dashboard.admin.systemStatus')}
            value={stats.systemHealth}
            icon={Activity}
            subValue={t('dashboard.admin.allSystemsOperational')}
            color="slate"
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
                  <div className="text-2xl font-bold">+12%</div>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.admin.sinceLastMonth', { defaultValue: 'from last month' })}
                  </p>
                  {/* Simplified Chart Placeholder */}
                  <div className="h-[100px] w-full mt-4 flex items-end justify-between gap-2 px-2">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <div key={i} className="w-full bg-primary/20 hover:bg-primary/40 rounded-t-sm transition-all" style={{ height: `${h}%` }}></div>
                    ))}
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
                  <div className="text-2xl font-bold">45%</div>
                  <p className="text-xs text-muted-foreground">
                    2.1 TB / 5 TB
                  </p>
                  <div className="h-2.5 w-full bg-secondary mt-4 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[45%] rounded-full" />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary"></div> Documents</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-muted"></div> Available</div>
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
                <StatusRow label="API Server" status="online" />
                <StatusRow label="Database Cluster" status="online" />
                <StatusRow label="File Storage" status="online" />
                <StatusRow label="Email Gateway" status="maintenance" />
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
    slate: "text-slate-600 bg-slate-50 dark:bg-slate-900/20 dark:text-slate-400",
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

function StatusRow({ label, status }: { label: string, status: 'online' | 'offline' | 'maintenance' }) {
  const styles = {
    online: "bg-green-500",
    offline: "bg-red-500",
    maintenance: "bg-amber-500",
  }

  const textStyles = {
    online: "text-green-600 dark:text-green-400",
    offline: "text-red-600 dark:text-red-400",
    maintenance: "text-amber-600 dark:text-amber-400",
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className={cn("text-xs font-medium capitalize", textStyles[status])}>{status}</span>
        <span className={cn("h-2.5 w-2.5 rounded-full ring-2 ring-transparent", styles[status])} />
      </div>
    </div>
  )
}
