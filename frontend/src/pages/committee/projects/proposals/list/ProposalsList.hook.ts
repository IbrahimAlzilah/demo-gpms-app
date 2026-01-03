import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDataTable } from '@/hooks/useDataTable'
import { committeeProposalService } from '../api/proposal.service'
import type { Proposal } from '@/types/project.types'
import type { ProposalsListState, ProposalsListData, ProposalStatusFilter } from './ProposalsList.types'

export function useProposalsList() {
  const { t } = useTranslation()
  
  const [state, setState] = useState<ProposalsListState>({
    selectedProposal: null,
    action: null,
    statusFilter: 'pending_review',
    proposalToEditId: null,
    proposalToDelete: null,
  })

  const {
    data: proposals,
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
