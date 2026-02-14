import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { committeeEvaluationService } from '../api/evaluation.service'
import type { EvaluationListState } from './EvaluationList.types'

export function useEvaluationList() {
  const { t } = useTranslation()

  const [state, setState] = useState<EvaluationListState>({
    selectedProjectId: null,
    selectedStudentId: null,
    showEvaluationForm: false,
    defenseStage: 'fd1', // Default to FD1
  })

  // Fetch projects for the selected defense stage
  const projectsQuery = useQuery({
    queryKey: ['discussion-committee-defense-projects', state.defenseStage],
    queryFn: () => committeeEvaluationService.getDefenseProjects(state.defenseStage),
    staleTime: 30000, // 30 seconds
  })

  const projects = projectsQuery.data || []

  return {
    state,
    setState,
    projects,
    isLoading: projectsQuery.isLoading,
    error: projectsQuery.error as Error | null,
    refetch: projectsQuery.refetch,
    t,
  }
}
