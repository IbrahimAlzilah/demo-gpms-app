import { useTranslation } from 'react-i18next'
import { MainLayout } from '@/layouts/MainLayout'
import { GradesView } from '@/features/student/components/GradesView'
import { BlockContent } from '@/components/common'
import { Button } from '@/components/ui'
import { Printer, Download } from 'lucide-react'
import { useGrades } from '@/features/student/hooks/useGrades'

export function GradesPage() {
  const { t } = useTranslation()
  const { data: grades, isLoading, error } = useGrades()

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    if (!grades || grades.length === 0) return

    const content = grades.map((grade) => {
      let text = t('grades.title') + '\n'
      text += '========\n\n'
      if (grade.supervisorGrade) {
        text += `${t('grades.supervisorGrade')}: ${grade.supervisorGrade.score} / ${grade.supervisorGrade.maxScore}\n`
        if (grade.supervisorGrade.comments) {
          text += `${t('grades.comments')}: ${grade.supervisorGrade.comments}\n`
        }
      }
      if (grade.committeeGrade) {
        text += `${t('grades.committeeGrade')}: ${grade.committeeGrade.score} / ${grade.committeeGrade.maxScore}\n`
        if (grade.committeeGrade.comments) {
          text += `${t('grades.comments')}: ${grade.committeeGrade.comments}\n`
        }
      }
      if (grade.finalGrade) {
        text += `${t('grades.finalGrade')}: ${grade.finalGrade.toFixed(2)}\n`
      }
      text += `${t('grades.status')}: ${grade.isApproved ? t('grades.approved') : t('grades.notApproved')}\n`
      return text
    }).join('\n---\n\n')

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `grades-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const actions = (
    <div className="flex gap-2">
      <Button onClick={handlePrint} variant="outline">
        <Printer className="mr-2 h-4 w-4" />
        {t('grades.print')}
      </Button>
      <Button onClick={handleExport} variant="outline">
        <Download className="mr-2 h-4 w-4" />
        {t('grades.export')}
      </Button>
    </div>
  )

  return (
    <MainLayout>
      <BlockContent title={t('nav.grades')} actions={actions}>
        <GradesView grades={grades} isLoading={isLoading} error={error} />
      </BlockContent>
    </MainLayout>
  )
}
