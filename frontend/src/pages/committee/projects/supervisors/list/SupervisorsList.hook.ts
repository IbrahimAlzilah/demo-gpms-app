import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectsWithoutSupervisor, useAvailableSupervisors } from '../hooks/useSupervisors'
import type { SupervisorsListState, SupervisorsListData } from './SupervisorsList.types'

export function useSupervisorsList() {
  const { t } = useTranslation()
  const { 
    data: projectsData, 
    isLoading: projectsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useProjectsWithoutSupervisor()
  const { data: supervisors, isLoading: supervisorsLoading } = useAvailableSupervisors()
  
  const [state, setState] = useState<SupervisorsListState>({
    selectedProject: null,
    selectedSupervisor: '',
  })

  // Flatten projects from infinite query pages
  const projects = projectsData ? projectsData.pages.flatMap(page => page.data) : []
  const totalProjects = projectsData?.pages[0]?.meta?.total || 0

  const data: SupervisorsListData = {
    projects,
    supervisors: supervisors || [],
    isLoading: projectsLoading || supervisorsLoading,
    error: null,
  }

  return {
    data,
    state,
    setState,
    t,
    pagination: {
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      totalProjects
    }
  }
}
