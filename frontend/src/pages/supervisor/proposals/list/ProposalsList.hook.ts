import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useDataTable } from '@/hooks/useDataTable'
import { proposalService } from '../api/proposal.service'
import type { Proposal } from '@/types/project.types'
import type { ProposalStatistics } from '../types/Proposals.types'
import type { ProposalsListState, ProposalsListData } from './ProposalsList.types'

export function useProposalsList() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  
  const [state, setState] = useState<ProposalsListState>({
    selectedProposal: null,
    showForm: false,
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
    queryKey: ['supervisor-proposals-table'],
    queryFn: (params) => {
      // Filter to only user's proposals
      const filters = { ...params?.filters, submitterId: user?.id }
      return proposalService.getTableData({ ...params, filters })
    },
    initialPageSize: 10,
    enableServerSide: true,
  })

  // Calculate statistics
  const statistics = useMemo<ProposalStatistics>(() => {
    if (!proposals) return { total: 0, pending: 0, approved: 0, rejected: 0 }

    return {
      total: proposals.length,
      pending: proposals.filter((p: Proposal) => p.status === 'pending_review').length,
      approved: proposals.filter((p: Proposal) => p.status === 'approved').length,
      rejected: proposals.filter((p: Proposal) => p.status === 'rejected').length,
    }
  }, [proposals])

  const data: ProposalsListData = {
    proposals: proposals || [],
    statistics,
    isLoading,
    error: error as Error | null,
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
