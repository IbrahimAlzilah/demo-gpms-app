import { useQuery } from '@tanstack/react-query'
import { gradeService } from '../api/grade.service'
import { useAuthStore } from '@/pages/auth/login'

/**
 * Fetch all grades for the current user
 * @param isApproved - Optional filter to show only approved grades
 */
export function useGrades(isApproved?: boolean) {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['grades', user?.id, isApproved],
    queryFn: () => {
      if (!user) throw new Error('User not authenticated')
      return gradeService.getGrades(user.id, isApproved)
    },
    enabled: !!user,
  })
}

/**
 * Fetch a single grade by ID
 */
export function useGrade(id: string) {
  return useQuery({
    queryKey: ['grades', id],
    queryFn: () => gradeService.getGradeById(id),
    enabled: !!id,
  })
}
