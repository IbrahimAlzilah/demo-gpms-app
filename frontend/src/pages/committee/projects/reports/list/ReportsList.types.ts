import type { ReportData } from '../api/report.service'

export interface ReportsListState {
  isGenerating: boolean
}

export interface ReportsListData {
  report: ReportData | undefined
  isLoading: boolean
  error: Error | null
}

export type ReportType = 'projects' | 'students' | 'assessments' | 'general' | 'overview' | 'supervisors' | 'requests' | 'deadlines' | 'history'