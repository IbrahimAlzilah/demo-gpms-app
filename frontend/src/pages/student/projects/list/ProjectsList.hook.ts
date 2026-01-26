import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDataTable } from '@/hooks/useDataTable'
import { projectService } from '../api/project.service'
import { usePeriodCheck } from '@/hooks/usePeriodCheck'
import { useStudentRegistrations } from '../hooks/useProjects'
import { useMyGroup } from '@/pages/student/groups/hooks/useGroups'
import type { ProjectsListState, ProjectsListData } from './ProjectsList.types'

export function useProjectsList() {
  const { t } = useTranslation()
  const { isPeriodActive, isLoading: periodLoading } = usePeriodCheck('project_registration')
  const { data: registrations } = useStudentRegistrations()
  const { data: studentGroup, isLoading: groupLoading } = useMyGroup()

  const [state, setState] = useState<ProjectsListState>({
    selectedProject: null,
    showRegistrationForm: false,
    showDetails: false,
    rejectionRegistration: null,
    showRejectionDetails: false,
  })

  const {
    data: projects,
    totalCount,
    pageCount,
    isLoading,
    error,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
  } = useDataTable({
    queryKey: ['student-projects-table'],
    queryFn: (params) => {
      // Fetch all visible projects (no status filter)
      return projectService.getTableData({ ...params })
    },
    initialPageSize: 10,
    enableServerSide: true,
  })

  const data: ProjectsListData = {
    projects: projects || [],
    isLoading,
    error: error as Error | null,
  }

  return {
    data,
    state,
    setState,
    isPeriodActive,
    periodLoading,
    registrations,
    studentGroup,
    groupLoading,
    // Table controls
    totalCount,
    pageCount,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
    t,
  }
}
