import { useTranslation } from 'react-i18next'
import { MainLayout } from '@/layouts/MainLayout'
import { BlockContent } from '@/components/common'
import { Button } from '@/components/ui'
import { Printer, Download } from 'lucide-react'
import { GradesList } from './list/GradesList.screen'
import { useGradeOperations } from './hooks/useGradeOperations'
import { useGrades } from './hooks/useGrades'

export function GradesPage() {
  const { t } = useTranslation()
  const { data: grades } = useGrades()
  const { handlePrint, handleExport } = useGradeOperations()

  const onPrint = () => {
    handlePrint()
  }

  const onExport = () => {
    if (grades) {
      handleExport(grades)
    }
  }

  const actions = (
    <div className="flex gap-2">
      <Button onClick={onPrint} variant="outline">
        <Printer className="mr-2 h-4 w-4" />
        {t('grades.print')}
      </Button>
      <Button onClick={onExport} variant="outline">
        <Download className="mr-2 h-4 w-4" />
        {t('grades.export')}
      </Button>
    </div>
  )

  return (
    <MainLayout>
      <BlockContent title={t('nav.grades')} actions={actions}>
        <GradesList />
      </BlockContent>
    </MainLayout>
  )
}
