import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { useAdminOverviewReport } from '../../hooks/useReports'
import type { ReportFilters } from '../../api/report.service'
import { FileText, Users, Award, TrendingUp, Clock, CheckCircle2, UserCheck } from 'lucide-react'

interface AdminOverviewTabProps {
  filters: ReportFilters
}

export function AdminOverviewTab({ filters }: AdminOverviewTabProps) {
  const { t } = useTranslation()
  const { data, isLoading, error } = useAdminOverviewReport(filters)

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        {t('common.errorLoadingData')}
      </div>
    )
  }

  if (!data) return null

  const { kpis, charts } = data

  const renderKPI = (
    title: string,
    value: string | number,
    subtext: React.ReactNode,
    icon: React.ReactNode,
    colorClass: string
  ) => (
    <Card>
      <CardContent className="px-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>
            {subtext && <div className="text-xs text-muted-foreground mt-1">{subtext}</div>}
          </div>
          <div className={`p-3 rounded-full bg-opacity-10 ${colorClass.replace('text-', 'bg-')}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {kpis.users && renderKPI(
          t('admin.reports.kpis.users'),
          kpis.users.total,
          Object.keys(kpis.users.byRole || {}).length > 0
            ? `${Object.keys(kpis.users.byRole).length} ${t('admin.reports.roles')}`
            : null,
          <UserCheck className="h-6 w-6 text-slate-600" />,
          'text-slate-600'
        )}

        {renderKPI(
          t('committee.reports.kpis.projects'),
          kpis.projects.total,
          Object.keys(kpis.projects.byStatus || {}).length > 0
            ? `${Object.keys(kpis.projects.byStatus).length} ${t('common.statuses')}`
            : null,
          <FileText className="h-6 w-6 text-blue-600" />,
          'text-blue-600'
        )}

        {renderKPI(
          t('committee.reports.kpis.students'),
          kpis.students.total,
          <>
            <span className="text-green-600 font-medium">{kpis.students.registered}</span> {t('committee.reports.registered')} •{' '}
            <span className="text-amber-600 font-medium">{kpis.students.unregistered}</span> {t('committee.reports.unregistered')}
          </>,
          <Users className="h-6 w-6 text-green-600" />,
          'text-green-600'
        )}

        {renderKPI(
          t('committee.reports.kpis.evaluations'),
          kpis.evaluations.total,
          `${t('committee.reports.averageGrade')}: ${kpis.evaluations.averageGrade}`,
          <Award className="h-6 w-6 text-purple-600" />,
          'text-purple-600'
        )}

        {renderKPI(
          t('committee.reports.kpis.requests'),
          kpis.requests.total,
          null,
          <TrendingUp className="h-6 w-6 text-amber-600" />,
          'text-amber-600'
        )}

        {renderKPI(
          t('committee.reports.kpis.milestones'),
          kpis.milestones.total,
          <>
            <span className="text-green-600">{kpis.milestones.completed} {t('common.completed')}</span> •{' '}
            <span className="text-red-600">{kpis.milestones.overdue} {t('common.overdue')}</span>
          </>,
          <Clock className="h-6 w-6 text-orange-600" />,
          'text-orange-600'
        )}

        {renderKPI(
          t('committee.reports.kpis.proposals'),
          kpis.proposals.total,
          null,
          <CheckCircle2 className="h-6 w-6 text-indigo-600" />,
          'text-indigo-600'
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {kpis.users && Object.keys(kpis.users.byRole || {}).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">{t('admin.reports.usersByRole')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(kpis.users.byRole).map(([role, count]) => {
                  const total = kpis.users.total || 1
                  const percentage = Math.round((Number(count) / total) * 100)
                  return (
                    <div key={role} className="space-y-1.5">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-muted-foreground">{t(`roles.${role}`) || role}</span>
                        <span className="font-bold">
                          {count} <span className="text-xs text-muted-foreground font-normal">({percentage}%)</span>
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-secondary/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">{t('committee.reports.projectsByStatus')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(kpis.projects.byStatus || {}).map(([status, count]) => {
                const total = kpis.projects.total || 1
                const percentage = Math.round((Number(count) / total) * 100)
                return (
                  <div key={status} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-muted-foreground">{status}</span>
                      <span className="font-bold">
                        {count} <span className="text-xs text-muted-foreground font-normal">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-secondary/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              {Object.keys(kpis.projects.byStatus || {}).length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">{t('common.noData')}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {charts && charts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('committee.reports.projectsOverTime')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8 mt-2">
              {charts.slice(-6).map((chart, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm tracking-tight">{chart.label}</h4>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{chart.month}</span>
                  </div>
                  <div className="flex gap-4 items-end h-32 w-full">
                    {Object.entries(chart.data).map(([status, count]) => {
                      const numericCount = Number(count)
                      const maxValue = Math.max(...Object.values(chart.data).map(Number), 1)
                      const heightPercentage = maxValue > 0 ? (numericCount / maxValue) * 100 : 0
                      return (
                        <div key={status} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full bg-secondary/20 rounded-t-sm h-full flex items-end">
                            <div
                              className="w-full bg-primary/80 transition-all duration-500 rounded-t-lg"
                              style={{ height: `${heightPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground truncate max-w-[100px] text-center" title={status}>
                            {status}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
