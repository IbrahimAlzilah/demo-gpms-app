import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useProjects } from '@/pages/student/projects/hooks/useProjects'
import { usePeriodCheck } from '@/hooks/usePeriodCheck'
import { useDataTable } from '@/hooks/useDataTable'
import { documentService } from '../api/document.service'
import type { Document } from '@/types/request.types'
import type { DocumentsListState, DocumentsListData } from './DocumentsList.types'

export function useDocumentsList() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { data: projects } = useProjects()
  const { isPeriodActive, isLoading: periodLoading } = usePeriodCheck('document_submission')

  const [state, setState] = useState<DocumentsListState>({
    selectedDocument: null,
    showUploadForm: false,
    selectedProjectId: undefined,
  })

  // Get user's project
  const userProject = projects?.find((p) => p.students.some((s) => s.id === user?.id))

  // Set default project if user has one
  useEffect(() => {
    if (!state.selectedProjectId && userProject) {
      setTimeout(() => {
        setState((prev) => ({ ...prev, selectedProjectId: userProject.id }))
      }, 0)
    }
  }, [state.selectedProjectId, userProject])

  const {
    data: documents,
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
    queryKey: ['student-documents-table', state.selectedProjectId || ''],
    queryFn: (params) => documentService.getTableData(params, state.selectedProjectId),
    initialPageSize: 10,
    enableServerSide: true,
  })

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!documents) return { total: 0, pending: 0, approved: 0, rejected: 0 }

    return {
      total: documents.length,
      pending: documents.filter((d: Document) => d.reviewStatus === 'pending').length,
      approved: documents.filter((d: Document) => d.reviewStatus === 'approved').length,
      rejected: documents.filter((d: Document) => d.reviewStatus === 'rejected').length,
    }
  }, [documents])

  const data: DocumentsListData = {
    documents: documents || [],
    statistics,
    isLoading: isLoading || periodLoading,
    error: error as Error | null,
  }

  return {
    data,
    state,
    setState,
    userProject,
    isPeriodActive,
    periodLoading,
    // Table controls
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
