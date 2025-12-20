import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../../layouts/MainLayout'
import { TimePeriodManager } from '../../../features/projects-committee/components/TimePeriodManager'
import { Calendar } from 'lucide-react'

export function PeriodsPage() {
  const { t } = useTranslation()

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8 text-primary" />
            {t('nav.periods')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('committee.periodsDescription')}
          </p>
        </div>
        <TimePeriodManager />
      </div>
    </MainLayout>
  )
}

