import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardTitle } from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { useAdminHistoryReport } from '../../hooks/useReports'

export function AdminHistoryTab() {
  const { t } = useTranslation()
  const { data, isLoading, error } = useAdminHistoryReport(5)

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

  const sortedPeriods = [...(data.periods || [])].sort(
    (a, b) => new Date(a.start_date || 0).getTime() - new Date(b.start_date || 0).getTime()
  )

  const chartData = sortedPeriods.map((p) => ({
    label: p.period_name,
    value: (p.kpis as any)?.projects?.total || 0,
    students: (p.kpis as any)?.students?.total || 0,
  }))

  const maxProjectValue = Math.max(...chartData.map((d) => d.value), 1)

  return (
    <div className="space-y-6">
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('committee.reports.historicalTrends')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-6 px-4 pb-2">
              {chartData.map((d, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div className="absolute -top-12 bg-popover text-popover-foreground text-xs px-2 py-1.5 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border pointer-events-none">
                    <div className="font-semibold">{d.label}</div>
                    <div>
                      {t('committee.reports.projects')}: {d.value}
                    </div>
                    <div>
                      {t('committee.reports.students')}: {d.students}
                    </div>
                  </div>
                  <div className="w-full bg-secondary/20 rounded-t-sm h-full flex items-end relative overflow-hidden hover:bg-secondary/30 transition-colors cursor-pointer rounded-lg">
                    <div
                      className="w-full bg-primary/80 group-hover:bg-primary transition-all duration-500 rounded-t-lg mx-auto max-w-[60px]"
                      style={{ height: `${(d.value / maxProjectValue) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground text-center line-clamp-2 max-w-[100px]" title={d.label}>
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <h3 className="font-semibold text-lg">{t('committee.reports.periodDetails')}</h3>
      <div className="grid grid-cols-1 gap-4">
        {(data.periods || []).map((period) => (
          <Card key={period.period_id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold">{period.period_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {period.academic_year} {period.semester && `• ${period.semester}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {period.start_date} → {period.end_date}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">{t('committee.reports.projects')}</p>
                  <p className="font-semibold">{(period.kpis as any)?.projects?.total ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('committee.reports.students')}</p>
                  <p className="font-semibold">{(period.kpis as any)?.students?.total ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('committee.reports.evaluations')}</p>
                  <p className="font-semibold">{(period.kpis as any)?.evaluations?.total ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('committee.reports.requests')}</p>
                  <p className="font-semibold">{(period.kpis as any)?.requests?.total ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {(!data.periods || data.periods.length === 0) && (
        <div className="text-center py-12 text-muted-foreground">{t('common.noData')}</div>
      )}
    </div>
  )
}
