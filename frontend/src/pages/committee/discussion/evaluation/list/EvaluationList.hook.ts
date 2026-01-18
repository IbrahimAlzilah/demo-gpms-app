import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/pages/auth/login'
import { useEvaluationProjects, useEvaluationsForProjects } from '../hooks/useEvaluations'
import type { EvaluationListState, EvaluationListData, EvaluationListItem } from './EvaluationList.types'

export function useEvaluationList() {
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const [state, setState] = useState<EvaluationListState>({
    selectedProjectId: null,
    selectedStudentId: null,
    showEvaluationForm: false,
  })

  // Fetch assigned projects
  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useEvaluationProjects(user?.id)

  // Fetch evaluations for each project
  const evaluationQueries = useEvaluationsForProjects(projects)

  // Combine projects with evaluations to create list items
  const items = useMemo<EvaluationListItem[]>(() => {
    if (!projects) return []

    return projects.flatMap((project, projectIndex) => {
      // Get evaluations for this project (evaluationQueries index matches projects index)
      const evaluations = evaluationQueries[projectIndex]?.data || []

      // If project has no students, skip it
      if (!project.students || project.students.length === 0) {
        return []
      }

      // Create an item for each student in the project
      return project.students.map((student) => {
        const evaluation = evaluations.find((e) => e.studentId === student.id)
        return {
          project,
          student,
          hasEvaluation: !!evaluation,
          evaluation,
        }
      })
    })
  }, [projects, evaluationQueries])

  const isLoading = projectsLoading || evaluationQueries.some((q) => q.isLoading)
  const error = projectsError || evaluationQueries.find((q) => q.error)?.error || null

  const data: EvaluationListData = {
    items,
    isLoading,
    error: error as Error | null,
    pageCount: Math.ceil(items.length / 10), // Simple pagination, adjust as needed
  }

  return {
    data,
    state,
    setState,
    t,
  }
}
