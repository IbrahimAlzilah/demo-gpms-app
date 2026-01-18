// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Screens
export { ReportsList } from "./list/ReportsList.screen"

// Hooks
export { useProjectsReport } from "./hooks/useReports"

// Types
export type {
  ReportsListState,
  ReportsListData,
} from "./list/ReportsList.types"
export type * from "./types"

// API Services (for internal use, but exported for flexibility)
export { committeeReportService } from './api/report.service'
export type { ReportData } from './api/report.service'
