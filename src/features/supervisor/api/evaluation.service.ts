import { mockEvaluationService } from '../../../lib/mock/evaluation.mock'
import type { Grade } from '../../../types/evaluation.types'

export const supervisorEvaluationService = {
  submitGrade: async (
    projectId: string,
    studentId: string,
    grade: {
      score: number
      maxScore: number
      criteria: Record<string, number>
      comments?: string
    },
    evaluatedBy: string
  ): Promise<Grade> => {
    return mockEvaluationService.submitSupervisorGrade(
      projectId,
      studentId,
      grade,
      evaluatedBy
    )
  },

  getGrades: async (projectId: string): Promise<Grade[]> => {
    return mockEvaluationService.getGrades(projectId)
  },
}

