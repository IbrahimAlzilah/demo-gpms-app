import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useProjectGrades } from '../hooks/useProgress'
import { projectService } from '@/pages/supervisor/projects/api/project.service'
import { useSupervisorProject } from '@/pages/supervisor/projects/hooks/useProjects'
import type { ProgressListState, ProgressListData } from './ProgressList.types'

export function useProgressList(projectId: string) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  
  const [state, setState] = useState<ProgressListState>({
    notes: '',
  })

  const { data: grades, isLoading } = useProjectGrades(projectId)
  const { data: project } = useSupervisorProject(projectId)

  const { data: supervisorNotes, isLoading: notesLoading } = useQuery({
    queryKey: ['supervisor-notes', projectId],
    queryFn: () => projectService.getSupervisorNotes(projectId),
    enabled: !!projectId,
  })

  const saveNote = useMutation({
    mutationFn: async (content: string) => {
      return projectService.addSupervisorNote(projectId, content)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supervisor-notes', projectId] })
      setState((prev) => ({ ...prev, notes: '' }))
    },
  })

  const data: ProgressListData = {
    supervisorNotes,
    grades,
    project,
    isLoading,
    notesLoading,
  }

  return {
    data,
    state,
    setState,
    saveNote,
    t,
  }
}
