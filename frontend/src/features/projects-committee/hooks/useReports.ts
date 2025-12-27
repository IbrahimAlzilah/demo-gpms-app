import { useQuery } from '@tanstack/react-query'
import { committeeReportService } from '../api/report.service'

export function useProjectsReport() {
  return useQuery({
    queryKey: ['committee-reports', 'projects'],
    queryFn: () => committeeReportService.generateProjectsReport(),
  })
}

