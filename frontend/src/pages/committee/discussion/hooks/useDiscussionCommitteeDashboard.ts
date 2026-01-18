import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useAuthStore } from '@/pages/auth/login'
import { useProjects } from '../projects/hooks/useProjects'
import { committeeEvaluationService } from '../evaluation/api/evaluation.service'
import type { Grade } from '@/types/evaluation.types'

export interface DashboardStats {
  assignedProjects: number
  pendingEvaluations: number
  completedEvaluations: number
  upcomingDefenses: number
}

export interface PendingEvaluation {
  projectId: string
  projectTitle: string
  createdAt: string
}

export interface DefenseScheduleItem {
  projectId: string
  projectTitle: string
  scheduledDate: string
  time?: string
  location?: string
}

export interface DashboardData {
  stats: DashboardStats
  pendingEvaluations: PendingEvaluation[]
  defenseSchedule: DefenseScheduleItem[]
}

/**
 * Hook to fetch all dashboard data for Discussion Committee Dashboard
 */
export function useDiscussionCommitteeDashboard() {
  const { user } = useAuthStore()

  // Fetch assigned projects
  const { data: projects, isLoading: projectsLoading, error: projectsError, refetch: refetchProjects } = useProjects(user?.id)

  // Fetch evaluations for all projects
  const evaluationsQueries = useQueries({
    queries: (projects || []).map((project) => ({
      queryKey: ['discussion-committee-dashboard-evaluations', project.id],
      queryFn: () => committeeEvaluationService.getEvaluationsByProject(project.id),
      enabled: !!project.id,
    })),
  })

  // Compute aggregated states
  const isLoadingEvaluations = evaluationsQueries.some(q => q.isLoading)
  const evaluationsErrors = evaluationsQueries.map(q => q.error).filter(Boolean)
  const evaluationsData = evaluationsQueries.map(q => q.data).filter(Boolean) as Grade[][]

  const isLoading = projectsLoading || isLoadingEvaluations
  const error = projectsError || evaluationsErrors[0] || null

  // Compute stats and pending evaluations
  const { stats, pendingEvaluationsList, defenseSchedule }: {
    stats: DashboardStats
    pendingEvaluationsList: PendingEvaluation[]
    defenseSchedule: DefenseScheduleItem[]
  } = useMemo(() => {
    if (!projects || projects.length === 0) {
      return {
        stats: {
          assignedProjects: 0,
          pendingEvaluations: 0,
          completedEvaluations: 0,
          upcomingDefenses: 0,
        },
        pendingEvaluationsList: [],
        defenseSchedule: [],
      }
    }

    const assignedProjectsCount = projects.length

    // Count pending and completed evaluations
    let pendingCount = 0
    let completedCount = 0
    const pendingEvals: PendingEvaluation[] = []
    
    projects.forEach((project, index) => {
      const evaluations = evaluationsData[index] || []
      
      // Check if all students in the project have committee evaluations
      const studentsInProject = project.students || []
      const evaluatedStudentIds = new Set(
        evaluations.filter(e => e.committeeGrade).map(e => e.studentId)
      )
      
      const allStudentsEvaluated = studentsInProject.length > 0 && 
        studentsInProject.every(student => evaluatedStudentIds.has(student.id))
      
      if (allStudentsEvaluated) {
        completedCount++
      } else if (studentsInProject.length > 0) {
        pendingCount++
        // Add to pending evaluations list (sorted by creation date)
        pendingEvals.push({
          projectId: project.id,
          projectTitle: project.title,
          createdAt: project.createdAt,
        })
      }
    })

    // Sort pending evaluations by creation date (oldest first)
    pendingEvals.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

    // For defense schedule, we'll leave it as 0 for now
    // In a real implementation, this would fetch from meetings/milestones API
    // or a dedicated defense schedule endpoint
    const upcomingDefenses = 0
    const defenses: DefenseScheduleItem[] = []

    return {
      stats: {
        assignedProjects: assignedProjectsCount,
        pendingEvaluations: pendingCount,
        completedEvaluations: completedCount,
        upcomingDefenses,
      },
      pendingEvaluationsList: pendingEvals.slice(0, 5), // Limit to 5 most recent pending
      defenseSchedule: defenses.slice(0, 5), // Limit to 5 upcoming
    }
  }, [projects, evaluationsData])

  // Refetch all queries
  const refetch = () => {
    refetchProjects()
    evaluationsQueries.forEach(q => q.refetch())
  }

  const data: DashboardData = {
    stats,
    pendingEvaluations: pendingEvaluationsList,
    defenseSchedule,
  }

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  }
}