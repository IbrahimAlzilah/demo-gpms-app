import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { useOverviewReport } from '../../hooks/useReports'
import type { ReportFilters } from '../../api/report.service'
import { FileText, Users, Award, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'

interface OverviewTabProps {
  filters: ReportFilters
  onExport: (reportType: string, format: 'pdf' | 'excel') => void
}

export function OverviewTab({ filters }: OverviewTabProps) {
  const { t } = useTranslation()
  const { data, isLoading, error } = useOverviewReport(filters)

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

  if (!data) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  const { kpis } = data

  const renderKPI = (title: string, value: string | number, subtext: string | React.ReactNode, icon: React.ReactNode, colorClass: string) => (
    <Card>
      <CardContent className="px-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>
            {subtext && <div className="text-xs text-muted-foreground mt-1">{subtext}</div>}
          </div>
          <div className={`p-3 rounded-full bg-opacity-10 ${colorClass.replace('text-', '1bg-')}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderKPI(
          t('committee.reports.kpis.projects'),
          kpis.projects.total,
          Object.keys(kpis.projects.byStatus || {}).length > 0 ? `${Object.keys(kpis.projects.byStatus).length} ${t('common.statuses')}` : null,
          <FileText className="h-6 w-6 text-blue-600" />,
          'text-blue-600'
        )}

        {renderKPI(
          t('committee.reports.kpis.students'),
          kpis.students.total,
          <>
            <span className="text-green-600 font-medium">{kpis.students.registered}</span> {t('committee.reports.registered')} • <span className="text-amber-600 font-medium">{kpis.students.unregistered}</span> {t('committee.reports.unregistered')}
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
            <span className="text-green-600">{kpis.milestones.completed} {t('common.completed')}</span> • <span className="text-red-600">{kpis.milestones.overdue} {t('common.overdue')}</span>
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

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-base font-semibold">{t('committee.reports.projectsByStatus')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(kpis.projects.byStatus || {}).map(([status, count]) => {
                const total = kpis.projects.total || 1
                const percentage = Math.round(((count as number) / total) * 100)
                return (
                  <div key={status} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-muted-foreground">{status}</span>
                      <span className="font-bold">{count as number} <span className="text-xs text-muted-foreground font-normal">({percentage}%)</span></span>
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
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {t('common.noData')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Requests Breakdown */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-base font-semibold">{t('committee.reports.requestsByStatus')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(kpis.requests.byStatus || {}).map(([status, count]) => {
                const total = kpis.requests.total || 1
                const percentage = Math.round(((count as number) / total) * 100)
                return (
                  <div key={status} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-muted-foreground">{status}</span>
                      <span className="font-bold">{count as number} <span className="text-xs text-muted-foreground font-normal">({percentage}%)</span></span>
                    </div>
                    <div className="h-2.5 w-full bg-secondary/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              {Object.keys(kpis.requests.byStatus || {}).length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {t('common.noData')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {kpis.students?.by_defense_status && Object.keys(kpis.students.by_defense_status).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">{t('committee.reports.studentsByDefenseStatus')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(['completed', 'ready_for_fd2', 'ready_for_fd1', 'in_progress'] as const).map((status) => (
                <div key={status} className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground font-medium">{t(`committee.reports.defenseStatus.${status}`)}</p>
                  <p className="text-2xl font-bold mt-1">{kpis.students.by_defense_status[status] ?? 0}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
