import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { useHistoryReport } from '../../hooks/useReports'

interface HistoryTabProps {
  onExport: (reportType: string, format: 'pdf' | 'excel') => void
}

export function HistoryTab({ }: HistoryTabProps) {
  const { t } = useTranslation()
  const { data, isLoading, error } = useHistoryReport(5)

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        {t('common.errorLoadingData')}
      </div>
    )
  }

  const sortedPeriods = [...data.periods].sort((a, b) => new Date(a.start_date || 0).getTime() - new Date(b.start_date || 0).getTime())

  const chartData = sortedPeriods.map(p => ({
    label: p.period_name,
    value: p.kpis?.projects?.total || 0,
    students: p.kpis?.students?.total || 0
  }))

  const maxProjectValue = Math.max(...chartData.map(d => d.value), 1)

  return (
    <div className="space-y-6">
      {/* Trends Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('committee.reports.historicalTrends')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-6 px-4 pb-2">
              {chartData.map((data, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-12 bg-popover text-popover-foreground text-xs px-2 py-1.5 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border pointer-events-none">
                    <div className="font-semibold">{data.label}</div>
                    <div>{t('committee.reports.projects')}: {data.value}</div>
                    <div>{t('committee.reports.students')}: {data.students}</div>
                  </div>

                  <div className="w-full bg-secondary/20 rounded-t-sm h-full flex items-end relative overflow-hidden hover:bg-secondary/30 transition-colors cursor-pointer rounded-lg">
                    <div
                      className="w-full bg-primary/80 group-hover:bg-primary transition-all duration-500 rounded-t-lg mx-auto max-w-[60px]"
                      style={{ height: `${(data.value / maxProjectValue) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground text-center line-clamp-2 md:line-clamp-1 h-8 max-w-[100px]" title={data.label}>{data.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Cards */}
      <h3 className="font-semibold text-lg">{t('committee.reports.periodDetails')}</h3>
      <div className="grid grid-cols-1 gap-4">
        {data.periods.map((period) => (
          <Card key={period.period_id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{period.period_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {period.academic_year && `${period.academic_year} - `}
                    {period.semester && `${period.semester} - `}
                    {period.start_date} to {period.end_date}
                  </p>
                </div>
              </div>

              {period.kpis && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-secondary/10 rounded-lg">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{t('committee.reports.projects')}</div>
                    <div className="text-xl font-bold mt-1 text-primary">{period.kpis.projects?.total || 0}</div>
                  </div>
                  <div className="p-3 bg-secondary/10 rounded-lg">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{t('committee.reports.students')}</div>
                    <div className="text-xl font-bold mt-1 text-green-600">{period.kpis.students?.total || 0}</div>
                  </div>
                  <div className="p-3 bg-secondary/10 rounded-lg">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{t('committee.reports.evaluations')}</div>
                    <div className="text-xl font-bold mt-1 text-purple-600">{period.kpis.evaluations?.total || 0}</div>
                  </div>
                  <div className="p-3 bg-secondary/10 rounded-lg">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{t('committee.reports.averageGrade')}</div>
                    <div className="text-xl font-bold mt-1 text-amber-600">{period.kpis.evaluations?.averageGrade || 0}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
