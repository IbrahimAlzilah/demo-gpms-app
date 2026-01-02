import { useMutation } from '@tanstack/react-query'
import { reportService, type ReportType, type ReportOptions } from '@/features/admin/api/report.service'

export function useGenerateReport() {
  return useMutation({
    mutationFn: ({ type, options }: { type: ReportType; options?: ReportOptions }) =>
      reportService.generateReport(type, options),
  })
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: ({ type, options }: { type: ReportType; options?: ReportOptions }) =>
      reportService.downloadReport(type, options),
  })
}
