import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDownloadReport } from '../hooks/useReportOperations'
import { useToast } from '@/components/common'
import type { ReportType } from '../api/report.service'
import type { ReportsListState, ReportsListData } from './ReportsList.types'

export function useReportsList() {
  const { t } = useTranslation()
  const { success, error: toastError } = useToast()

  const downloadReport = useDownloadReport()

  const [state, setState] = useState<ReportsListState>({
    loadingReport: null,
  })

  const handleGenerateReport = async (type: ReportType) => {
    setState((prev) => ({ ...prev, loadingReport: type }))
    try {
      await downloadReport.mutateAsync({ type, options: { format: 'pdf' } })
      success(`تم توليد تقرير ${type} بنجاح`)
    } catch (error) {
      console.error('Error generating report:', error)
      toastError(
        `فشل في توليد التقرير: ${
          error instanceof Error ? error.message : 'خطأ غير معروف'
        }`
      )
    } finally {
      setState((prev) => ({ ...prev, loadingReport: null }))
    }
  }

  const data: ReportsListData = {}

  return {
    data,
    state,
    setState,
    handleGenerateReport,
    t,
  }
}
