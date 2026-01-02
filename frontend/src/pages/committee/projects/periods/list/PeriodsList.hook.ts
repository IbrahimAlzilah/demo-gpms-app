import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDataTable } from '@/hooks/useDataTable'
import { periodService } from '../api/period.service'
import { timePeriodSchema, type TimePeriodSchema } from '../schema'
import type { PeriodType } from '@/types/period.types'
import type { TimePeriod } from '@/types/period.types'
import type { PeriodsListState, PeriodsListData } from './PeriodsList.types'

export function usePeriodsList() {
  const { t } = useTranslation()
  
  const [state, setState] = useState<PeriodsListState>({
    showForm: false,
    showDeleteDialog: false,
    selectedPeriod: null,
    success: false,
    formData: {
      name: '',
      type: undefined as PeriodType | undefined,
      startDate: '',
      endDate: '',
      academicYear: '',
      semester: '',
    },
  })

  const form = useForm<TimePeriodSchema>({
    resolver: zodResolver(timePeriodSchema(t)),
    defaultValues: {
      name: '',
      type: undefined as PeriodType | undefined,
      startDate: '',
      endDate: '',
      academicYear: '',
      semester: '',
    },
  })

  const {
    data: periods,
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
    queryKey: ['committee-periods-table'],
    queryFn: (params) => periodService.getTableData(params),
    initialPageSize: 10,
    enableServerSide: true,
  })

  const data: PeriodsListData = {
    periods: periods || [],
    isLoading,
    error: error as Error | null,
    pageCount,
  }

  return {
    data,
    state,
    setState,
    form,
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
