import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDataTable } from '@/hooks/useDataTable'
import { usePeriodCheck } from '@/hooks/usePeriodCheck'
import { committeeGradeService } from '../api/grade.service'
import type { GradesListState, GradesListData, GradeApprovalFilter } from './GradesList.types'

export function useGradesList() {
  const { t } = useTranslation()
  const { isPeriodActive, isLoading: periodLoading } = usePeriodCheck('grade_approval')
  
  const [state, setState] = useState<GradesListState>({
    approvalFilter: 'pending',
    selectedGrade: null,
    action: null,
    showDialog: false,
    gradeToViewId: null,
  })

  const {
    data: grades,
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
    queryKey: ['committee-grades-table', state.approvalFilter],
    queryFn: (params) => {
      const filters = { ...params?.filters }
      const isApproved = state.approvalFilter === 'approved' ? true : state.approvalFilter === 'pending' ? false : undefined
      return committeeGradeService.getTableData({ ...params, filters }, isApproved)
    },
    initialPageSize: 10,
    enableServerSide: true,
  })

  const data: GradesListData = {
    grades: grades || [],
    isLoading,
    error: error as Error | null,
    pageCount,
  }

  return {
    data,
    state,
    setState,
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
    // Time window status
    isPeriodActive,
    periodLoading,
    t,
  }
}
