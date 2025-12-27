import { apiClient } from '../../../lib/axios'

export type ReportType = 'projects' | 'students' | 'evaluations' | 'proposals' | 'supervisors'

export interface ReportOptions {
  format?: 'pdf' | 'excel' | 'csv'
  startDate?: string
  endDate?: string
  filters?: Record<string, any>
}

export const reportService = {
  generateReport: async (type: ReportType, options?: ReportOptions): Promise<Blob> => {
    const response = await apiClient.post(
      `/admin/reports/${type}`,
      options || {},
      {
        responseType: 'blob',
      }
    )
    return response.data as Blob
  },

  downloadReport: async (type: ReportType, options?: ReportOptions): Promise<void> => {
    const blob = await this.generateReport(type, options)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    const format = options?.format || 'pdf'
    const extension = format === 'excel' ? 'xlsx' : format === 'csv' ? 'csv' : 'pdf'
    link.download = `${type}_report_${new Date().toISOString().split('T')[0]}.${extension}`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },
}

