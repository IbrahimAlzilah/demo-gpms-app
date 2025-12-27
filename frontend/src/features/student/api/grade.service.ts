import { mockEvaluationService } from '../../../lib/mock/evaluation.mock'
import type { Grade } from '../../../types/evaluation.types'

export const gradeService = {
  getGrades: async (studentId: string): Promise<Grade[]> => {
    return mockEvaluationService.getGrades(undefined, studentId)
  },

  getGradeById: async (id: string): Promise<Grade | null> => {
    return mockEvaluationService.getGradeById(id)
  },
}

