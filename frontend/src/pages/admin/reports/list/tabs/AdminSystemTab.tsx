import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { useAdminSystemReport } from '../../hooks/useReports'
import { Calendar, Clock, AlertCircle } from 'lucide-react'

export function AdminSystemTab() {
  const { t } = useTranslation()
  const { data, isLoading, error } = useAdminSystemReport()

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

  const { summary, active_periods, upcoming_periods } = data

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-medium">{t('admin.reports.totalPeriods')}</p>
            </div>
            <p className="text-2xl font-bold mt-2">{summary.total_periods}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              <p className="text-sm text-muted-foreground font-medium">{t('admin.reports.activePeriods')}</p>
            </div>
            <p className="text-2xl font-bold mt-2 text-green-600">{summary.active_periods}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <p className="text-sm text-muted-foreground font-medium">{t('admin.reports.upcomingPeriods')}</p>
            </div>
            <p className="text-2xl font-bold mt-2 text-amber-600">{summary.upcoming_periods}</p>
          </CardContent>
        </Card>
      </div>

      {active_periods && active_periods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              {t('admin.reports.currentlyActivePeriods')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {active_periods.map((period) => (
                <div
                  key={period.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"
                >
                  <div>
                    <p className="font-medium">{period.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('admin.reports.type')}: {period.type}
                      {period.academic_year && ` • ${period.academic_year}`}
                      {period.semester && ` • ${period.semester}`}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{period.start_date} → {period.end_date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {upcoming_periods && upcoming_periods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              {t('admin.reports.upcomingPeriods')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcoming_periods.map((period) => (
                <div
                  key={period.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"
                >
                  <div>
                    <p className="font-medium">{period.name}</p>
                    <p className="text-sm text-muted-foreground">{period.type}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{period.start_date} → {period.end_date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(!active_periods || active_periods.length === 0) && (!upcoming_periods || upcoming_periods.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t('admin.reports.noPeriodsConfigured')}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
