import type { ReportType, ReportOptions } from '../api/report.service'

/**
 * Report list screen props
 */
export interface ReportsListScreenProps {
  // No props needed - uses route context
}

/**
 * Report card props
 */
export interface ReportCardProps {
  title: string
  description: string
  type: ReportType
  isLoading: boolean
  onGenerate: (type: ReportType) => void
}

/**
 * Extended report options
 */
export type { ReportOptions, ReportType }
