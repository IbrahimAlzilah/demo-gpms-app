import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectsReport } from '../hooks/useReports'
import type { ReportsListState, ReportsListData } from './ReportsList.types'

export function useReportsList() {
  const { t } = useTranslation()
  const { data: report, isLoading, error, refetch } = useProjectsReport()
  
  const [state, setState] = useState<ReportsListState>({
    isGenerating: false,
  })

  const data: ReportsListData = {
    report,
    isLoading,
    error: error as Error | null,
  }

  const handleGenerate = async () => {
    setState((prev) => ({ ...prev, isGenerating: true }))
    try {
      await refetch()
    } finally {
      setState((prev) => ({ ...prev, isGenerating: false }))
    }
  }

  return {
    data,
    state,
    setState,
    handleGenerate,
    refetch,
    t,
  }
}
