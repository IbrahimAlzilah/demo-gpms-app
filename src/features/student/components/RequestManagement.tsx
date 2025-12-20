import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../auth/store/auth.store'
import { RequestSubmissionForm } from './RequestSubmissionForm'
import type { Request } from '../../../types/request.types'
import { createRequestColumns } from './RequestTableColumns'
import { useDataTable } from '@/hooks/useDataTable'
import { requestService } from '../api/request.service'
import { useCancelRequest } from '../hooks/useRequests'
import { DataTable, Button } from '@/components/ui'
import { BlockContent, ModalDialog, ConfirmDialog, StatusBadge, useToast } from '@/components/common'
import { AlertCircle, PlusCircle, FileCheck, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'

export function RequestManagement() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { showToast } = useToast()
  const cancelRequest = useCancelRequest()
  const [showForm, setShowForm] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [requestToCancel, setRequestToCancel] = useState<Request | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const {
    data: requests,
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
    queryKey: ['student-requests-table'],
    queryFn: (params) => requestService.getTableData(params, user?.id),
    initialPageSize: 10,
    enableServerSide: true,
  })

  const handleCancel = async () => {
    if (!requestToCancel) return
    try {
      await cancelRequest.mutateAsync(requestToCancel.id)
      showToast(t('request.cancelSuccess'), 'success')
      setRequestToCancel(null)
      setShowCancelDialog(false)
    } catch {
      showToast(t('request.cancelError'), 'error')
    }
  }

  const columns = useMemo(
    () =>
      createRequestColumns({
        onView: (request) => {
          setSelectedRequest(request)
        },
        onCancel: (request) => {
          setRequestToCancel(request)
          setShowCancelDialog(true)
        },
        rtl,
        t,
      }),
    [rtl, t]
  )

  const handleFormSuccess = () => {
    setShowForm(false)
  }

  // Calculate statistics
  const stats = useMemo(() => {
    if (!requests) return { total: 0, pending: 0, approved: 0, rejected: 0 }

    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'committee_approved').length,
      rejected: requests.filter((r) => r.status === 'committee_rejected' || r.status === 'supervisor_rejected').length,
    }
  }, [requests])

  const actions = useMemo(() => (
    <Button onClick={() => setShowForm(true)}>
      <PlusCircle className="mr-2 h-4 w-4" />
      {t('request.newRequest')}
    </Button>
  ), [t])

  return (
    <>
      {/* Statistics Cards */}
      {stats.total > 0 && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('request.total')}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileCheck className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('request.status.pending')}</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('request.status.approved')}</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('request.status.rejected')}</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>
        </div>
      )}

      <BlockContent title={t('nav.requests')} actions={actions}>
        <DataTable
          columns={columns}
          data={requests}
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
          rtl={rtl}
          enableFiltering={true}
          enableViews={true}
          emptyMessage={t('request.noRequests')}
        />
      </BlockContent>

      {error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('request.loadError')}</span>
          </div>
        </BlockContent>
      )}

      <ModalDialog open={showForm} onOpenChange={setShowForm} title={t('request.submitNew')}>
        <RequestSubmissionForm onSuccess={handleFormSuccess} />
      </ModalDialog>

      {/* Request Detail Dialog */}
      {selectedRequest && (
        <ModalDialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)} title={t('request.request')}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <StatusBadge status={selectedRequest.status} />
              <span className="text-sm text-muted-foreground">
                {t('request.submittedAt')} {formatDate(selectedRequest.createdAt)}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                {t('request.reason')}
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {selectedRequest.reason}
              </p>
            </div>

            {/* Workflow Timeline */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">{t('request.workflow')}</h4>

              {/* Submitted */}
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{t('request.submitted')}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(selectedRequest.createdAt)}</p>
                </div>
              </div>

              {/* Supervisor Decision */}
              {selectedRequest.supervisorApproval ? (
                <div className={`flex items-start gap-3 p-3 rounded-lg ${selectedRequest.supervisorApproval.approved
                  ? 'bg-success/10'
                  : 'bg-destructive/10'
                  }`}>
                  {selectedRequest.supervisorApproval.approved ? (
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {t('request.supervisorDecision')}: {' '}
                      {selectedRequest.supervisorApproval.approved
                        ? (t('request.approved'))
                        : (t('request.rejected'))
                      }
                    </p>
                    {selectedRequest.supervisorApproval.comments && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedRequest.supervisorApproval.comments}
                      </p>
                    )}
                    {selectedRequest.supervisorApproval.approvedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(selectedRequest.supervisorApproval.approvedAt)}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Clock className="h-5 w-5 text-warning mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t('request.awaitingSupervisor')}</p>
                  </div>
                </div>
              )}

              {/* Committee Decision */}
              {selectedRequest.committeeApproval ? (
                <div className={`flex items-start gap-3 p-3 rounded-lg ${selectedRequest.committeeApproval.approved
                  ? 'bg-success/10'
                  : 'bg-destructive/10'
                  }`}>
                  {selectedRequest.committeeApproval.approved ? (
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {t('request.committeeDecision')}: {' '}
                      {selectedRequest.committeeApproval.approved
                        ? (t('request.approved'))
                        : (t('request.rejected'))
                      }
                    </p>
                    {selectedRequest.committeeApproval.comments && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedRequest.committeeApproval.comments}
                      </p>
                    )}
                    {selectedRequest.committeeApproval.approvedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(selectedRequest.committeeApproval.approvedAt)}
                      </p>
                    )}
                  </div>
                </div>
              ) : selectedRequest.supervisorApproval?.approved && (
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Clock className="h-5 w-5 text-warning mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t('request.awaitingCommittee')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ModalDialog>
      )}

      <ConfirmDialog
        open={showCancelDialog}
        onClose={() => {
          setShowCancelDialog(false)
          setRequestToCancel(null)
        }}
        onConfirm={handleCancel}
        title={t('request.cancelTitle')}
        description={t('request.cancelDescription')}
        confirmLabel={t('request.cancel')}
        cancelLabel={t('common.cancel')}
        variant="destructive"
      />
    </>
  )
}



