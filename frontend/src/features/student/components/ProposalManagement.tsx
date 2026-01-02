import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { useAuthStore } from '../../auth/store/auth.store'
import { ProposalForm } from './ProposalForm'
import type { Proposal } from '../../../types/project.types'
import { createProposalColumns } from './ProposalTableColumns'
import { useDataTable } from '@/hooks/useDataTable'
import { proposalService } from '../api/proposal.service'
import { useUpdateProposal } from '../hooks/useProposals'
import { DataTable, Button } from '@/components/ui'
import { BlockContent, ModalDialog, StatusBadge, useToast } from '@/components/common'
import { AlertCircle, PlusCircle, FileText, MessageSquare, RotateCcw } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import { ROUTES } from '@/lib/constants'

export function ProposalManagement() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const location = useLocation()
  const { showToast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [showResubmitDialog, setShowResubmitDialog] = useState(false)
  const [proposalToResubmit, setProposalToResubmit] = useState<Proposal | null>(null)
  const updateProposal = useUpdateProposal()

  // Determine the current route type
  const isMyProposals = location.pathname === ROUTES.STUDENT.MY_PROPOSALS
  const isApprovedProposals = location.pathname === ROUTES.STUDENT.APPROVED_PROPOSALS

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
    queryKey: ['student-proposals-table', location.pathname],
    queryFn: (params) => {
      const filters: Record<string, unknown> = { ...params?.filters }
      
      if (isMyProposals) {
        // My Proposals: fetch only proposals created by the logged-in user
        filters.submitterId = user?.id
      } else if (isApprovedProposals) {
        // Approved Proposals: fetch all proposals with approved status
        filters.status = 'approved'
        // Don't filter by submitterId to show all approved proposals
      } else {
        // Default: show user's proposals (for backward compatibility)
        filters.submitterId = user?.id
      }
      
      return proposalService.getTableData({ ...params, filters })
    },
    initialPageSize: 10,
    enableServerSide: true,
  })

  const columns = useMemo(
    () =>
      createProposalColumns({
        onView: (proposal) => {
          setSelectedProposal(proposal)
        },
        t,
      }),
    [t]
  )

  const handleFormSuccess = () => {
    setShowForm(false)
    showToast(t('proposal.submitSuccess'), 'success')
  }

  const handleResubmit = async (proposal: Proposal) => {
    try {
      await updateProposal.mutateAsync({
        id: proposal.id,
        data: {
          ...proposal,
          status: 'pending_review' as const,
        },
      })
      showToast(t('proposal.resubmitSuccess'), 'success')
      setShowResubmitDialog(false)
      setProposalToResubmit(null)
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t('proposal.resubmitError'),
        'error'
      )
    }
  }

  // Calculate statistics
  const stats = useMemo(() => {
    if (!proposals) return { total: 0, pending: 0, approved: 0, rejected: 0 }

    return {
      total: proposals.length,
      pending: proposals.filter((p: Proposal) => p.status === 'pending_review').length,
      approved: proposals.filter((p: Proposal) => p.status === 'approved').length,
      rejected: proposals.filter((p: Proposal) => p.status === 'rejected').length,
    }
  }, [proposals])

  const actions = useMemo(() => (
    <Button onClick={() => setShowForm(true)}>
      <PlusCircle className="mr-2 h-4 w-4" />
      {t('proposal.submitNew')}
    </Button>
  ), [t])

  return (
    <>
      {/* Statistics Cards - Only show for "My Proposals" */}
      {isMyProposals && stats.total > 0 && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('proposal.total')}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('proposal.status.pendingReview')}</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <FileText className="h-8 w-8 text-warning" />
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('proposal.status.approved')}</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <FileText className="h-8 w-8 text-success" />
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('proposal.status.rejected')}</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
              <FileText className="h-8 w-8 text-destructive" />
            </div>
          </div>
        </div>
      )}

      <BlockContent 
        title={
          isMyProposals 
            ? t('nav.myProposals') 
            : isApprovedProposals 
            ? t('nav.approvedProposals') 
            : t('nav.proposals')
        } 
        actions={actions}
      >
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
          enableFiltering={true}
          enableViews={true}
          emptyMessage={t('proposal.noProposals')}
        />
      </BlockContent>

      {error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('proposal.loadError')}</span>
          </div>
        </BlockContent>
      )}

      <ModalDialog open={showForm} onOpenChange={setShowForm} title={t('proposal.submitNew')}>
        <ProposalForm
          onSuccess={handleFormSuccess}
        />
      </ModalDialog>

      {/* Proposal Detail Dialog */}
      {selectedProposal && (
        <ModalDialog open={!!selectedProposal} onOpenChange={(open) => !open && setSelectedProposal(null)} title={selectedProposal?.title}>
          <div className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-4 text-sm">
              <StatusBadge status={selectedProposal?.status} />
              <span className="text-muted-foreground">
                {t('proposal.submittedAt')} {formatDate(selectedProposal?.createdAt)}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">{t('proposal.description')}</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {selectedProposal?.description}
              </p>
            </div>

            {selectedProposal?.objectives && (
              <div>
                <h4 className="text-sm font-medium mb-2">{t('proposal.objectives')}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedProposal?.objectives}
                </p>
              </div>
            )}

            {selectedProposal?.methodology && (
              <div>
                <h4 className="text-sm font-medium mb-2">{t('proposal.methodology')}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedProposal?.methodology}
                </p>
              </div>
            )}

            {selectedProposal?.expectedOutcomes && (
              <div>
                <h4 className="text-sm font-medium mb-2">{t('proposal.expectedOutcomes')}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedProposal?.expectedOutcomes}
                </p>
              </div>
            )}

            {selectedProposal?.reviewNotes && (
              <div className="rounded-lg bg-muted p-4 border border-muted-foreground/20">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium">{t('proposal.reviewNotes')}</h4>
                </div>
                <p className="text-sm whitespace-pre-wrap">{selectedProposal?.reviewNotes}</p>
                {selectedProposal?.reviewedAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('proposal.reviewedAt')} {formatDate(selectedProposal?.reviewedAt)}
                  </p>
                )}
              </div>
            )}

            {selectedProposal?.status === 'requires_modification' && (
              <div className="mt-4 pt-4 border-t">
                <Button
                  onClick={() => {
                    setProposalToResubmit(selectedProposal)
                    setShowResubmitDialog(true)
                  }}
                  className="w-full"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {t('proposal.resubmit')}
                </Button>
              </div>
            )}
          </div>
        </ModalDialog>
      )}

      {/* Resubmit Confirmation Dialog */}
      <ModalDialog
        open={showResubmitDialog}
        onOpenChange={setShowResubmitDialog}
        title={t('proposal.resubmitTitle')}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('proposal.resubmitMessage')}
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowResubmitDialog(false)
                setProposalToResubmit(null)
              }}
              disabled={updateProposal.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={() => proposalToResubmit && handleResubmit(proposalToResubmit)}
              disabled={updateProposal.isPending}
            >
              {updateProposal.isPending ? (
                <>
                  <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.processing')}
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {t('proposal.resubmit')}
                </>
              )}
            </Button>
          </div>
        </div>
      </ModalDialog>
    </>
  )
}



