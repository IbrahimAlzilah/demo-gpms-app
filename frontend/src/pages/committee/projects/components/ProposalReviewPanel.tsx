import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useApproveProposal, useRejectProposal, useRequestModification } from '../hooks/useProposalManagement'
import { DataTable, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from '@/components/ui'
import { BlockContent } from '@/components/common'
import { createProposalColumns } from './ProposalTableColumns'
import { useDataTable } from '@/hooks/useDataTable'
import { committeeProposalService } from '../api/proposal.service'
import { ProposalReviewDialog } from './ProposalReviewDialog'
import type { Proposal } from '@/types/project.types'
import { AlertCircle } from 'lucide-react'
import { useToast } from '@/components/common'

type ProposalStatusFilter = 'all' | 'pending_review' | 'approved' | 'rejected' | 'requires_modification'

export function ProposalReviewPanel() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const approveProposal = useApproveProposal()
  const rejectProposal = useRejectProposal()
  const requestModification = useRequestModification()
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [action, setAction] = useState<'approve' | 'reject' | 'modify' | null>(null)
  const [statusFilter, setStatusFilter] = useState<ProposalStatusFilter>('pending_review')

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
    queryKey: ['committee-proposals-table', statusFilter],
    queryFn: (params) => committeeProposalService.getTableData(
      params, 
      statusFilter === 'all' ? undefined : statusFilter
    ),
    initialPageSize: 10,
    enableServerSide: true,
  })

  const columns = useMemo(
    () =>
      createProposalColumns({
        onApprove: (proposal) => {
          setSelectedProposal(proposal)
          setAction('approve')
        },
        onReject: (proposal) => {
          setSelectedProposal(proposal)
          setAction('reject')
        },
        onRequestModification: (proposal) => {
          setSelectedProposal(proposal)
          setAction('modify')
        },
      }),
    []
  )

  const handleConfirm = async (
    proposalId: string,
    actionType: 'approve' | 'reject' | 'modify',
    notes?: string
  ) => {
    try {
      if (actionType === 'approve') {
        await approveProposal.mutateAsync({ id: proposalId })
        showToast(t('committee.proposal.approveSuccess'), 'success')
      } else if (actionType === 'reject') {
        await rejectProposal.mutateAsync({ id: proposalId, reviewNotes: notes })
        showToast(t('committee.proposal.rejectSuccess'), 'success')
      } else if (actionType === 'modify') {
        if (!notes) {
          showToast(t('committee.proposal.modificationsRequired'), 'error')
          return
        }
        await requestModification.mutateAsync({ id: proposalId, reviewNotes: notes })
        showToast(t('committee.proposal.modifySuccess'), 'success')
      }
      setSelectedProposal(null)
      setAction(null)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : t('committee.proposal.processError')
      showToast(errorMsg, 'error')
    }
  }

  const isLoadingAction =
    approveProposal.isPending || rejectProposal.isPending || requestModification.isPending

  return (
    <>
      <BlockContent title={t('committee.proposal.reviewPanel')}>
        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="status-filter">{t('committee.proposal.filterByStatus')}</Label>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as ProposalStatusFilter)}
            >
              <SelectTrigger id="status-filter" className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('committee.proposal.allProposals')}</SelectItem>
                <SelectItem value="pending_review">{t('proposal.status.pendingReview')}</SelectItem>
                <SelectItem value="approved">{t('proposal.status.approved')}</SelectItem>
                <SelectItem value="rejected">{t('proposal.status.rejected')}</SelectItem>
                <SelectItem value="requires_modification">{t('proposal.status.requiresModification')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={proposals}
          isLoading={isLoading}
          error={error}
          pageCount={pageCount}
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          onPaginationChange={(pageIndex, pageSize) => {
            setPagination({ pageIndex, pageSize })
          }}
          sorting={sorting}
          onSortingChange={setSorting}
          columnFilters={columnFilters}
          onColumnFiltersChange={setColumnFilters}
          searchValue={globalFilter}
          onSearchChange={setGlobalFilter}
          searchPlaceholder={t('committee.proposal.searchPlaceholder')}
          enableFiltering={true}
          enableViews={true}
          emptyMessage={t('committee.proposal.noProposals')}
        />
      </BlockContent>

      {error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('committee.proposal.loadError')}</span>
          </div>
        </BlockContent>
      )}

      <ProposalReviewDialog
        proposal={selectedProposal}
        action={action}
        onClose={() => {
          setSelectedProposal(null)
          setAction(null)
        }}
        onConfirm={handleConfirm}
        isLoading={isLoadingAction}
      />
    </>
  )
}
