import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDataTable } from '@/hooks/useDataTable'
import { committeeSubmissionService } from '../api/submission.service'
import type { ProposalsListState, ProposalsListData } from './ProposalsList.types'
import type { ProposalSubmission } from '@/types/project.types'

export function useProposalsList() {
  const { t } = useTranslation()
  
  const [state, setState] = useState<ProposalsListState>({
    selectedProposal: null,
    selectedSubmission: null,
    action: null,
    statusFilter: 'all',
    proposalToEditId: null,
    submissionToDelete: null,
    proposalToViewId: null,
    submissionToViewId: null,
  })

  const {
    data: submissions,
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
    queryKey: ['committee-submissions-table', state.statusFilter],
    queryFn: (params) => committeeSubmissionService.getTableData(
      params, 
      state.statusFilter === 'all' ? undefined : state.statusFilter
    ),
    initialPageSize: 10,
    enableServerSide: true,
  })

  const data: ProposalsListData = {
    proposals: [], // Legacy - kept for compatibility
    submissions: (submissions || []) as ProposalSubmission[],
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
