import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supervisorEvaluationService } from '../api/evaluation.service'
import { useAuthStore } from '../../auth/store/auth.store'

export function useProjectGrades(projectId: string) {
  return useQuery({
    queryKey: ['supervisor-grades', projectId],
    queryFn: () => supervisorEvaluationService.getGrades(projectId),
    enabled: !!projectId,
  })
}

export function useSubmitGrade() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: ({
      projectId,
      studentId,
      grade,
    }: {
      projectId: string
      studentId: string
      grade: {
        score: number
        maxScore: number
        criteria: Record<string, number>
        comments?: string
      }
    }) => {
      if (!user) throw new Error('User not authenticated')
      return supervisorEvaluationService.submitGrade(
        projectId,
        studentId,
        grade,
        user.id
      )
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['supervisor-grades', variables.projectId],
      })
    },
  })
}

