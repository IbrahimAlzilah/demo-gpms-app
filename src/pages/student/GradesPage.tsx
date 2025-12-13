import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../layouts/MainLayout'
import { GradesView } from '../../features/student/components/GradesView'
import { Award } from 'lucide-react'

export function GradesPage() {
  const { t } = useTranslation()

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Award className="h-8 w-8 text-primary" />
            {t('nav.grades') || 'استعراض الدرجات'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('grades.pageDescription') || 'الاطلاع على التقييمات والدرجات النهائية للمشاريع'}
          </p>
        </div>
        <GradesView />
      </div>
    </MainLayout>
  )
}
