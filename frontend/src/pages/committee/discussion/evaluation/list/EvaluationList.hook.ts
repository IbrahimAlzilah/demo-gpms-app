import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDataTable } from '@/hooks/useDataTable'
import { committeeEvaluationService } from '../api/evaluation.service'
import type { EvaluationListState, EvaluationListData } from './EvaluationList.types'

export function useEvaluationList() {
  const { t } = useTranslation()

  const [state, setState] = useState<EvaluationListState>({
    selectedProjectId: null,
    selectedStudentId: null,
    showEvaluationForm: false,
  })

  const {
    data: items,
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
    queryKey: ['discussion-committee-evaluations-table'],
    queryFn: (params) => committeeEvaluationService.getTableData(params),
    initialPageSize: 10,
    enableServerSide: true,
  })

  const data: EvaluationListData = {
    items: items || [],
    isLoading,
    error: error as Error | null,
    pageCount,
  }

  return {
    data,
    state,
    setState,
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
