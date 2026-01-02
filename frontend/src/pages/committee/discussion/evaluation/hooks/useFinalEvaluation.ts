import { useMutation, useQueryClient } from '@tanstack/react-query'
import { committeeEvaluationService } from '../api/evaluation.service'

export function useSubmitFinalGrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      projectId: string
      studentId: string
      grade: {
        score: number
        maxScore: number
        criteria: Record<string, unknown>
        comments?: string
      }
      committeeMembers: string[]
    }) => committeeEvaluationService.submitFinalGrade(data),
    onSuccess: (_, variables) => {
      // Invalidate evaluation queries for the specific project
      queryClient.invalidateQueries({ 
        queryKey: ['discussion-committee-evaluations', variables.projectId] 
      })
      // Invalidate the evaluation projects list
      queryClient.invalidateQueries({ 
        queryKey: ['discussion-committee-evaluation-projects'] 
      })
      // Also invalidate general evaluation queries for compatibility
      queryClient.invalidateQueries({ queryKey: ['discussion-evaluations'] })
      queryClient.invalidateQueries({ queryKey: ['evaluations'] })
    },
  })
}
