import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDataTable } from '@/hooks/useDataTable'
import { committeeProposalService } from '../api/proposal.service'
import type { ProposalsListState, ProposalsListData } from './ProposalsList.types'

export function useProposalsList() {
  const { t } = useTranslation()
  
  const [state, setState] = useState<ProposalsListState>({
    selectedProposal: null,
    action: null,
    statusFilter: 'all',
    proposalToEditId: null,
    proposalToDelete: null,
    proposalToViewId: null,
  })

  const {
    data: proposals,
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
    queryKey: ['committee-proposals-table', state.statusFilter],
    queryFn: (params) => committeeProposalService.getTableData(
      params, 
      state.statusFilter === 'all' ? undefined : state.statusFilter
    ),
    initialPageSize: 10,
    enableServerSide: true,
  })

  const data: ProposalsListData = {
    proposals: proposals || [],
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
