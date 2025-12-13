import { useState, useMemo } from 'react'
import { useApproveProposal, useRejectProposal, useRequestModification } from '../hooks/useProposalManagement'
import { DataTable } from '@/components/ui/data-table'
import { createProposalColumns } from './ProposalTableColumns'
import { useDataTable } from '@/hooks/useDataTable'
import { committeeProposalService } from '../api/proposal.service'
import { ProposalReviewDialog } from './ProposalReviewDialog'
import type { Proposal } from '@/types/project.types'

export function ProposalReviewPanel() {
  const approveProposal = useApproveProposal()
  const rejectProposal = useRejectProposal()
  const requestModification = useRequestModification()
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [action, setAction] = useState<'approve' | 'reject' | 'modify' | null>(null)

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
    rtl,
  } = useDataTable({
    queryKey: ['committee-proposals-table', 'pending'],
    queryFn: (params) => committeeProposalService.getTableData(params, 'pending_review'),
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
        rtl,
      }),
    [rtl]
  )

  const handleConfirm = async (
    proposalId: string,
    actionType: 'approve' | 'reject' | 'modify',
    notes?: string
  ) => {
    try {
      if (actionType === 'approve') {
        await approveProposal.mutateAsync({ id: proposalId })
      } else if (actionType === 'reject') {
        await rejectProposal.mutateAsync({ id: proposalId, reviewNotes: notes })
      } else if (actionType === 'modify') {
        if (!notes) {
          alert('يرجى إدخال ملاحظات التعديل')
          return
        }
        await requestModification.mutateAsync({ id: proposalId, reviewNotes: notes })
      }
      setSelectedProposal(null)
      setAction(null)
    } catch (err) {
      console.error('Error processing proposal:', err)
    }
  }

  const isLoadingAction =
    approveProposal.isPending || rejectProposal.isPending || requestModification.isPending

  return (
    <>
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
        searchPlaceholder="البحث في المقترحات..."
        rtl={rtl}
        enableFiltering={true}
        enableViews={true}
        emptyMessage="لا توجد مقترحات جديدة للمراجعة"
      />
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

