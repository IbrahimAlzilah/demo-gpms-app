import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { useOverviewReport, type ReportFilters } from '../../hooks/useReports'
import { FileText, Users, Award, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'

interface OverviewTabProps {
  filters: ReportFilters
  onExport: (reportType: string, format: 'pdf' | 'excel') => void
}

export function OverviewTab({ filters, onExport }: OverviewTabProps) {
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

  const { kpis, charts } = data

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('committee.reports.kpis.projects')}</p>
                <p className="text-2xl font-bold mt-1">{kpis.projects.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('committee.reports.kpis.students')}</p>
                <p className="text-2xl font-bold mt-1">{kpis.students.total}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {kpis.students.registered} {t('committee.reports.registered')}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('committee.reports.kpis.evaluations')}</p>
                <p className="text-2xl font-bold mt-1">{kpis.evaluations.total}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('committee.reports.averageGrade')}: {kpis.evaluations.averageGrade}
                </p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('committee.reports.kpis.requests')}</p>
                <p className="text-2xl font-bold mt-1">{kpis.requests.total}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('committee.reports.kpis.milestones')}</p>
                <p className="text-2xl font-bold mt-1">{kpis.milestones.total}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {kpis.milestones.completed} {t('common.completed')} / {kpis.milestones.overdue} {t('common.overdue')}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('committee.reports.kpis.proposals')}</p>
                <p className="text-2xl font-bold mt-1">{kpis.proposals.total}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">{t('committee.reports.projectsByStatus')}</h3>
            <div className="space-y-2">
              {Object.entries(kpis.projects.byStatus || {}).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm">{status}</span>
                  <span className="font-semibold">{count as number}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">{t('committee.reports.requestsByStatus')}</h3>
            <div className="space-y-2">
              {Object.entries(kpis.requests.byStatus || {}).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm">{status}</span>
                  <span className="font-semibold">{count as number}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simple Chart Visualization */}
      {charts && charts.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">{t('committee.reports.projectsOverTime')}</h3>
            <div className="space-y-4">
              {charts.map((chart, idx) => (
                <div key={idx} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{chart.label}</span>
                  </div>
                  <div className="flex gap-2">
                    {Object.entries(chart.data).map(([status, count]) => {
                      const maxValue = Math.max(...Object.values(chart.data).map(v => v as number), 1)
                      const percentage = maxValue > 0 ? ((count as number / maxValue) * 100) : 0
                      return (
                        <div key={status} className="flex-1">
                          <div className="text-xs text-muted-foreground mb-1">{status}</div>
                          <div className="h-4 bg-muted rounded overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="text-xs mt-1">{count as number}</div>
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
