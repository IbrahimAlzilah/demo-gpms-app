import { mockProjectService } from '../../../lib/mock/project.mock'
import { mockProposals } from '../../../lib/mock/project.mock'
import { mockRequests } from '../../../lib/mock/request.mock'
import { mockGrades } from '../../../lib/mock/evaluation.mock'

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
    await new Promise((resolve) => setTimeout(resolve, 500))
    const projects = await mockProjectService.getAll()
    const proposals = [...mockProposals]
    const requests = [...mockRequests]
    const grades = [...mockGrades]

    const projectsByStatus: Record<string, number> = {}
    projects.forEach((p) => {
      projectsByStatus[p.status] = (projectsByStatus[p.status] || 0) + 1
    })

    const proposalsByStatus: Record<string, number> = {}
    proposals.forEach((p) => {
      proposalsByStatus[p.status] = (proposalsByStatus[p.status] || 0) + 1
    })

    const requestsByStatus: Record<string, number> = {}
    requests.forEach((r) => {
      requestsByStatus[r.status] = (requestsByStatus[r.status] || 0) + 1
    })

    const totalGrades = grades.reduce((sum, g) => {
      return sum + (g.finalGrade || g.supervisorGrade?.score || 0)
    }, 0)
    const averageGrade = grades.length > 0 ? totalGrades / grades.length : 0

    return {
      projects: {
        total: projects.length,
        byStatus: projectsByStatus,
      },
      proposals: {
        total: proposals.length,
        byStatus: proposalsByStatus,
      },
      requests: {
        total: requests.length,
        byStatus: requestsByStatus,
      },
      evaluations: {
        total: grades.length,
        averageGrade: Math.round(averageGrade * 100) / 100,
      },
    }
  },
}

