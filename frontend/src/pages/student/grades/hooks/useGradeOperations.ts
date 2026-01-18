import { useTranslation } from 'react-i18next'
import type { Grade } from '@/types/evaluation.types'

/**
 * Hook for grade-related operations (print, export)
 */
export function useGradeOperations() {
  const { t } = useTranslation()

  const handlePrint = () => {
    window.print()
  }

  const handleExport = (grades: Grade[]) => {
    if (!grades || grades.length === 0) return

    const content = grades
      .map((grade) => {
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
      })
      .join('\n---\n\n')

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

  return {
    handlePrint,
    handleExport,
  }
}
