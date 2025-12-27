import { mockEvaluationService } from '../../../lib/mock/evaluation.mock'
import type { Grade } from '../../../types/evaluation.types'

export const committeeEvaluationService = {
  submitFinalGrade: async (
    projectId: string,
    studentId: string,
    grade: {
      score: number
      maxScore: number
      criteria: Record<string, number>
      comments?: string
    },
    evaluatedBy: string,
    committeeMembers: string[]
  ): Promise<Grade> => {
    return mockEvaluationService.submitCommitteeGrade(
      projectId,
      studentId,
      grade,
      evaluatedBy,
      committeeMembers
    )
  },

  getGrades: async (projectId: string): Promise<Grade[]> => {
    return mockEvaluationService.getGrades(projectId)
  },
}

