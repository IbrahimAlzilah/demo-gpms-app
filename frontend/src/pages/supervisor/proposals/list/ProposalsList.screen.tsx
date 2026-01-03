import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable, Button } from '@/components/ui'
import { BlockContent, ModalDialog, StatusBadge, useToast } from '@/components/common'
import { AlertCircle, PlusCircle, FileText, MessageSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import { createProposalColumns } from '../components/table'
import { StatisticsCards } from '../components/StatisticsCards'
import { ProposalForm } from '../components/ProposalForm'
import { useProposalsList } from './ProposalsList.hook'

export function ProposalsList() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const {
    data,
    state,
    setState,
    isMyProposals,
    isApprovedProposals,
    pageCount,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
  } = useProposalsList()

  const columns = useMemo(
    () =>
      createProposalColumns({
        onView: (proposal) => {
          setState((prev) => ({ ...prev, selectedProposal: proposal }))
        },
        t,
      }),
    [t, setState]
  )

  const handleFormSuccess = () => {
    setState((prev) => ({ ...prev, showForm: false }))
    showToast(t('proposal.submitSuccess'), 'success')
  }

  const actions = useMemo(
    () => (
      <Button onClick={() => setState((prev) => ({ ...prev, showForm: true }))}>
        <PlusCircle className="mr-2 h-4 w-4" />
        {t('proposal.submitNew')}
      </Button>
    ),
    [t, setState]
  )

  const pageTitle = isMyProposals
    ? t('nav.myProposals')
    : isApprovedProposals
    ? t('nav.approvedProposals')
    : t('nav.proposals')

  return (
    <>
      {/* Statistics Cards - Only show for "My Proposals" */}
      {isMyProposals && <StatisticsCards statistics={data.statistics} t={t} />}

      <BlockContent title={pageTitle} actions={actions}>
        <DataTable
          columns={columns}
          data={data.proposals}
          isLoading={data.isLoading}
          error={data.error}
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

      {data.error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('proposal.loadError')}</span>
          </div>
        </BlockContent>
      )}

      <ModalDialog 
        open={state.showForm} 
        onOpenChange={(open) => setState((prev) => ({ ...prev, showForm: open }))} 
        title={t('proposal.submitNew')}
      >
        <ProposalForm onSuccess={handleFormSuccess} />
      </ModalDialog>

      {/* Proposal Detail Dialog */}
      {state.selectedProposal && (
        <ModalDialog 
          open={!!state.selectedProposal} 
          onOpenChange={(open) => !open && setState((prev) => ({ ...prev, selectedProposal: null }))} 
          title={state.selectedProposal?.title}
        >
          <div className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-4 text-sm">
              <StatusBadge status={state.selectedProposal?.status} />
              <span className="text-muted-foreground">
                {t('proposal.submittedAt')} {formatDate(state.selectedProposal?.createdAt)}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">{t('proposal.description')}</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {state.selectedProposal?.description}
              </p>
            </div>

            {state.selectedProposal?.objectives && (
              <div>
                <h4 className="text-sm font-medium mb-2">{t('proposal.objectives')}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {state.selectedProposal?.objectives}
                </p>
              </div>
            )}

            {state.selectedProposal?.methodology && (
              <div>
                <h4 className="text-sm font-medium mb-2">{t('proposal.methodology')}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {state.selectedProposal?.methodology}
                </p>
              </div>
            )}

            {state.selectedProposal?.expectedOutcomes && (
              <div>
                <h4 className="text-sm font-medium mb-2">{t('proposal.expectedOutcomes')}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {state.selectedProposal?.expectedOutcomes}
                </p>
              </div>
            )}

            {state.selectedProposal?.reviewNotes && (
              <div className="rounded-lg bg-muted p-4 border border-muted-foreground/20">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium">{t('proposal.reviewNotes')}</h4>
                </div>
                <p className="text-sm whitespace-pre-wrap">{state.selectedProposal?.reviewNotes}</p>
                {state.selectedProposal?.reviewedAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('proposal.reviewedAt')} {formatDate(state.selectedProposal?.reviewedAt)}
                  </p>
                )}
              </div>
            )}
          </div>
        </ModalDialog>
      )}
    </>
  )
}
