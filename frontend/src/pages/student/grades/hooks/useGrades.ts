import { useQuery } from '@tanstack/react-query'
import { gradeService } from '../api/grade.service'
import { useAuthStore } from '@/features/auth/store/auth.store'

/**
 * Fetch all grades for the current user
 */
export function useGrades() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['grades', user?.id],
    queryFn: () => {
      if (!user) throw new Error('User not authenticated')
      return gradeService.getGrades(user.id)
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
