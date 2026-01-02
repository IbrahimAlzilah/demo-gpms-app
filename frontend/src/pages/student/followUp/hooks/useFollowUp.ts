import { useMemo } from 'react'
import { useProjects } from '@/pages/student/projects/hooks/useProjects'
import { useAuthStore } from '@/features/auth/store/auth.store'
import type { Project } from '@/types/project.types'

/**
 * Hook to fetch the current user's project
 */
export function useFollowUp() {
  const { user } = useAuthStore()
  const { data: projects, isLoading, error } = useProjects()

  // Get user's project
  const userProject = useMemo(() => {
    if (!projects || !user) return null
    return projects.find((p) => p.students.some((s) => s.id === user.id)) || null
  }, [projects, user])

  return {
    project: userProject,
    isLoading,
    error: error as Error | null,
  }
}
