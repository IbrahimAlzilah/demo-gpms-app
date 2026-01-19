import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/pages/auth/login'
import { useDataTable } from '@/hooks/useDataTable'
import { projectService } from '../api/project.service'
import type { ProjectsListState, ProjectsListData } from './ProjectsList.types'

export function useProjectsList() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  
  const [state, setState] = useState<ProjectsListState>({
    selectedProject: null,
    evaluationModal: {
      open: false,
      project: null,
      studentId: null
    }
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
    queryKey: ['supervisor-projects-table'],
    queryFn: (params) => projectService.getTableData(params, user?.id),
    initialPageSize: 10,
    enableServerSide: true,
  })

  const data: ProjectsListData = {
    projects: projects || [],
    isLoading,
    error: error as Error | null,
  }

  const openEvaluationModal = (project: any) => {
    setState(prev => ({
      ...prev,
      evaluationModal: {
        open: true,
        project,
        studentId: null
      }
    }))
  }

  const closeEvaluationModal = () => {
    setState(prev => ({
      ...prev,
      evaluationModal: {
        open: false,
        project: null,
        studentId: null
      }
    }))
  }

  const selectStudentForEvaluation = (studentId: string) => {
    setState(prev => ({
      ...prev,
      evaluationModal: {
        ...prev.evaluationModal,
        studentId
      }
    }))
  }

  return {
    data,
    state,
    setState,
    openEvaluationModal,
    closeEvaluationModal,
    selectStudentForEvaluation,
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
