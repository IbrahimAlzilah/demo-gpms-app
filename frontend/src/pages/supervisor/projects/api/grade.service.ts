import { apiClient } from '../../../../lib/axios'
import type { Grade } from '../../../../types/evaluation.types'

export const supervisorGradeService = {
  getProjectGrades: async (projectId: string): Promise<Grade[]> => {
    try {
      // Grades are included in project details
      const response = await apiClient.get<{ grades?: Grade[] }>(
        `/supervisor/projects/${projectId}`
      )
      return (response.data as { grades?: Grade[] })?.grades || []
    } catch {
      return []
    }
  },
}
