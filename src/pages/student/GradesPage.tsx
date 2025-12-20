import { useTranslation } from 'react-i18next'
import { MainLayout } from '@/layouts/MainLayout'
import { GradesView } from '@/features/student/components/GradesView'
import { BlockContent } from '@/components/common'

export function GradesPage() {
  const { t } = useTranslation()

  return (
    <MainLayout>
      <BlockContent title={t('nav.grades')}>
        <GradesView />
      </BlockContent>
    </MainLayout>
  )
}
