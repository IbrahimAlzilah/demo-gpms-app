import { apiClient } from '../../../../../lib/axios'

export interface ReportData {
  projects: {
    total: number
    byStatus: Record<string, number>
  }
  proposals: {
    total: number
    byStatus: Record<string, number>
  }
  requests: {
    total: number
    byStatus: Record<string, number>
  }
  evaluations: {
    total: number
    averageGrade: number
  }
}

export const committeeReportService = {
  generateProjectsReport: async (): Promise<ReportData> => {
    const response = await apiClient.get<ReportData>('/projects-committee/reports')
    return response.data
  },
}
