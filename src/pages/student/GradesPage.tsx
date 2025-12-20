import { useTranslation } from 'react-i18next'
import { MainLayout } from '@/layouts/MainLayout'
import { GradesView } from '@/features/student/components/GradesView'

export function GradesPage() {
  const { t } = useTranslation()

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          {t('nav.grades')}
        </h1>
        <GradesView />
      </div>
    </MainLayout>
  )
}
