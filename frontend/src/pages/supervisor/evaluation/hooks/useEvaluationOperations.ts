import { useMutation, useQueryClient } from '@tanstack/react-query'
import { evaluationService } from '../api/evaluation.service'
import { useAuthStore } from '@/pages/auth/login'

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
      return evaluationService.submitGrade(
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
