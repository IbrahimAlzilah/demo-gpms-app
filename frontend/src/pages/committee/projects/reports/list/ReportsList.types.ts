import type { ReportData } from '../api/report.service'

export interface ReportsListState {
  isGenerating: boolean
}

export interface ReportsListData {
  report: ReportData | undefined
  isLoading: boolean
  error: Error | null
}
