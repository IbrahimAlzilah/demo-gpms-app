import { useTranslation } from 'react-i18next'
import { useGrades } from '../hooks/useGrades'
import { useGradeOperations } from '../hooks/useGradeOperations'
import type { GradesListData } from './GradesList.types'

export function useGradesList() {
  const { t } = useTranslation()
  const { data: grades, isLoading, error } = useGrades()
  const { handlePrint, handleExport } = useGradeOperations()

  const data: GradesListData = {
    grades,
    isLoading,
    error: error as Error | null,
  }

  const onPrint = () => {
    handlePrint()
  }

  const onExport = () => {
    if (grades) {
      handleExport(grades)
    }
  }

  return {
    data,
    onPrint,
    onExport,
    t,
  }
}
