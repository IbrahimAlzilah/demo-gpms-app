import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectsWithoutSupervisor, useAvailableSupervisors } from '../hooks/useSupervisors'
import type { SupervisorsListState, SupervisorsListData } from './SupervisorsList.types'

export function useSupervisorsList() {
  const { t } = useTranslation()
  const { data: projects, isLoading: projectsLoading } = useProjectsWithoutSupervisor()
  const { data: supervisors, isLoading: supervisorsLoading } = useAvailableSupervisors()
  
  const [state, setState] = useState<SupervisorsListState>({
    selectedProject: null,
    selectedSupervisor: '',
  })

  const data: SupervisorsListData = {
    projects: projects || [],
    supervisors: (supervisors || []).map(s => ({ id: s.id, name: s.name })),
    isLoading: projectsLoading || supervisorsLoading,
    error: null,
  }

  return {
    data,
    state,
    setState,
    t,
  }
}
