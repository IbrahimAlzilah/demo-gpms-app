import { useState, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/pages/auth/login'
import { useDataTable } from '@/hooks/useDataTable'
import { proposalService } from '../api/proposal.service'
import { buildProposalFilters } from '../components/table/filter'
import type { Proposal } from '@/types/project.types'
import type { ProposalStatistics } from '../types/Proposals.types'
import type { ProposalsListState, ProposalsListData } from './ProposalsList.types'

export function useProposalsList() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const location = useLocation()
  
  const [state, setState] = useState<ProposalsListState>({
    selectedProposal: null,
    showForm: false,
  })

  // Build filters based on route
  const routeFilters = useMemo(
    () => buildProposalFilters(location.pathname, user?.id),
    [location.pathname, user?.id]
  )

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
    queryKey: ['supervisor-proposals-table', location.pathname],
    queryFn: (params) => {
      const filters: Record<string, unknown> = {
        ...routeFilters,
        ...params?.filters,
      }
      
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

  const isMyProposals = location.pathname.includes('/my')
  const isApprovedProposals = location.pathname.includes('/approved')

  return {
    data,
    state,
    setState,
    isMyProposals,
    isApprovedProposals,
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
