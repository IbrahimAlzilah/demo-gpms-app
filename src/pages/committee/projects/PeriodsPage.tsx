import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../../app/layouts/MainLayout'
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
            {t('nav.periods') || 'إعلان الفترات الزمنية'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('committee.periodsDescription') || 'إدارة الفترات الزمنية للمشاريع (تقديم المقترحات، التسجيل، تسليم الوثائق، التقييم، إلخ)'}
          </p>
        </div>
        <TimePeriodManager />
      </div>
    </MainLayout>
  )
}

