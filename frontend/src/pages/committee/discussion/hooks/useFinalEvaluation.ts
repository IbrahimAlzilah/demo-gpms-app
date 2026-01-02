import { useMutation, useQueryClient } from '@tanstack/react-query'
import { committeeEvaluationService } from '../api/evaluation.service'
import { useAuthStore } from '@/features/auth/store/auth.store'

export function useSubmitFinalGrade() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: ({
      projectId,
      studentId,
      grade,
      committeeMembers,
    }: {
      projectId: string
      studentId: string
      grade: {
        score: number
        maxScore: number
        criteria: Record<string, number>
        comments?: string
      }
      committeeMembers: string[]
    }) => {
      if (!user) throw new Error('User not authenticated')
      return committeeEvaluationService.submitFinalGrade(
        projectId,
        studentId,
        grade,
        user.id,
        committeeMembers
      )
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['committee-grades', variables.projectId],
      })
    },
  })
}
