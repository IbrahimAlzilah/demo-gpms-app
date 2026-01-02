import type { ReportType } from '../../api/report.service'

export interface ReportsListState {
  loadingReport: ReportType | null
}

export interface ReportsListData {
  // No additional data needed for reports list
}
