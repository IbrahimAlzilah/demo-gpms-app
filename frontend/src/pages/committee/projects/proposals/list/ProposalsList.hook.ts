import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDataTable } from '@/hooks/useDataTable'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import type { SortingState, ColumnFiltersState } from '@tanstack/react-table'
import { committeeProposalService } from '../api/proposal.service'
import type { ProposalsListState, ProposalsListData } from './ProposalsList.types'
import type { Submission } from '../types/GroupedSubmissions.types'
import { buildTableQueryParams } from '@/types/table.types'

export function useProposalsList() {
  const { t } = useTranslation()
  
  const [state, setState] = useState<ProposalsListState>({
    selectedProposal: null,
    action: null,
    statusFilter: 'all',
    proposalToEditId: null,
    proposalToDelete: null,
    proposalToViewId: null,
    viewMode: 'grouped', // Default to grouped view
    registrationDetails: [],
    showRegistrationWarning: false,
  })

  // Shared pagination and filter state for grouped view
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const isGroupedView = state.viewMode === 'grouped'

  // Individual proposals table (for individual view)
  const {
    data: proposals,
    totalCount: proposalsTotalCount,
    pageCount: proposalsPageCount,
    isLoading: proposalsLoading,
    error: proposalsError,
    sorting: proposalsSorting,
    setSorting: setProposalsSorting,
    columnFilters: proposalsColumnFilters,
    setColumnFilters: setProposalsColumnFilters,
    globalFilter: proposalsGlobalFilter,
    setGlobalFilter: setProposalsGlobalFilter,
    pagination: proposalsPagination,
    setPagination: setProposalsPagination,
  } = useDataTable({
    queryKey: ['committee-proposals-table', state.statusFilter],
    queryFn: (params) => committeeProposalService.getTableData(
      params, 
      state.statusFilter === 'all' ? undefined : state.statusFilter
    ),
    initialPageSize: 10,
    enableServerSide: true,
  })

  // Grouped submissions query (for grouped view)
  const submissionsQueryParams = useMemo(() => {
    if (!isGroupedView) return undefined
    return buildTableQueryParams({
      page: pagination.pageIndex,
      pageSize: pagination.pageSize,
      search: globalFilter,
    })
  }, [isGroupedView, pagination.pageIndex, pagination.pageSize, globalFilter])

  const {
    data: submissionsData,
    isLoading: submissionsLoading,
    error: submissionsError,
  } = useQuery({
    queryKey: ['committee-proposals-submissions', state.statusFilter, globalFilter, submissionsQueryParams],
    queryFn: async () => {
      if (!submissionsQueryParams) {
        return { data: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0 }
      }
      return committeeProposalService.getSubmissionsTableData(
        submissionsQueryParams,
        state.statusFilter === 'all' ? undefined : state.statusFilter,
        globalFilter || undefined
      )
    },
    enabled: isGroupedView && !!submissionsQueryParams,
    placeholderData: keepPreviousData,
  })

  // Sync pagination and filters between views
  // When switching views, maintain the same pagination state
  const currentSorting = isGroupedView ? sorting : proposalsSorting
  const currentSetSorting = isGroupedView ? setSorting : setProposalsSorting
  const currentColumnFilters = isGroupedView ? columnFilters : proposalsColumnFilters
  const currentSetColumnFilters = isGroupedView ? setColumnFilters : setProposalsColumnFilters
  const currentGlobalFilter = isGroupedView ? globalFilter : proposalsGlobalFilter
  const currentSetGlobalFilter = isGroupedView ? setGlobalFilter : setProposalsGlobalFilter
  const currentPagination = isGroupedView ? pagination : proposalsPagination
  const currentSetPagination = isGroupedView ? setPagination : setProposalsPagination

  // Determine which data to use based on view mode
  const isLoading = isGroupedView ? submissionsLoading : proposalsLoading
  const error = isGroupedView ? submissionsError : proposalsError
  const totalCount = isGroupedView ? (submissionsData?.totalCount || 0) : proposalsTotalCount
  const pageCount = isGroupedView ? (submissionsData?.totalPages || 0) : proposalsPageCount
  const submissions = isGroupedView ? (submissionsData?.data || []) : []

  const data: ProposalsListData = {
    proposals: proposals || [],
    submissions: submissions as Submission[],
    isLoading,
    error: error as Error | null,
    pageCount,
  }

  return {
    data,
    state,
    setState,
    // Table controls - use current view's state
    totalCount,
    pageCount,
    sorting: currentSorting,
    setSorting: currentSetSorting,
    columnFilters: currentColumnFilters,
    setColumnFilters: currentSetColumnFilters,
    globalFilter: currentGlobalFilter,
    setGlobalFilter: currentSetGlobalFilter,
    pagination: currentPagination,
    setPagination: currentSetPagination,
    t,
  }
}
