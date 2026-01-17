import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { useHistoryReport } from '../../hooks/useReports'

interface HistoryTabProps {
  onExport: (reportType: string, format: 'pdf' | 'excel') => void
}

export function HistoryTab({ onExport }: HistoryTabProps) {
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

  return (
    <div className="space-y-4">
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
                  <div>
                    <div className="text-sm text-muted-foreground">{t('committee.reports.projects')}</div>
                    <div className="text-xl font-bold">{period.kpis.projects?.total || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{t('committee.reports.students')}</div>
                    <div className="text-xl font-bold">{period.kpis.students?.total || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{t('committee.reports.evaluations')}</div>
                    <div className="text-xl font-bold">{period.kpis.evaluations?.total || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{t('committee.reports.averageGrade')}</div>
                    <div className="text-xl font-bold">{period.kpis.evaluations?.averageGrade || 0}</div>
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
