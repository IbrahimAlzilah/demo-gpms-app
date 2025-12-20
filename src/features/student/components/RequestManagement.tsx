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
import { BlockContent, ModalDialog, ConfirmDialog } from '@/components/common'
import { AlertCircle, PlusCircle, FileCheck, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDate } from '@/lib/utils/format'
import { useToast } from '@/components/common/NotificationToast'

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
      showToast(t('request.cancelSuccess') || 'تم إلغاء الطلب بنجاح', 'success')
      setRequestToCancel(null)
      setShowCancelDialog(false)
    } catch {
      showToast(t('request.cancelError') || 'فشل إلغاء الطلب', 'error')
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
      }),
    [rtl]
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
      {t('request.newRequest') || 'طلب جديد'}
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
                <p className="text-sm text-muted-foreground">{t('request.total') || 'المجموع'}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileCheck className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('request.status.pending') || 'معلقة'}</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('request.status.approved') || 'موافق عليها'}</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('request.status.rejected') || 'مرفوضة'}</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>
        </div>
      )}

      <BlockContent title={t('nav.requests') || 'الطلبات'} actions={actions}>
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
          searchPlaceholder={t('request.searchPlaceholder') || 'البحث في الطلبات...'}
          rtl={rtl}
          enableFiltering={true}
          enableViews={true}
          emptyMessage={t('request.noRequests') || 'لا توجد طلبات'}
        />
      </BlockContent>

      {error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('request.loadError') || 'حدث خطأ أثناء تحميل الطلبات'}</span>
          </div>
        </BlockContent>
      )}

      <ModalDialog open={showForm} onOpenChange={setShowForm} title={t('request.submitNew') || 'تقديم طلب جديد'}>
        <RequestSubmissionForm onSuccess={handleFormSuccess} />
      </ModalDialog>

      {/* Request Detail Dialog */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                {t('request.request') || 'طلب'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <StatusBadge status={selectedRequest.status} />
                <span className="text-sm text-muted-foreground">
                  {t('request.submittedAt') || 'تم الإرسال في'} {formatDate(selectedRequest.createdAt)}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  {t('request.reason') || 'السبب'}
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedRequest.reason}
                </p>
              </div>

              {/* Workflow Timeline */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">{t('request.workflow') || 'مسار الطلب'}</h4>

                {/* Submitted */}
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t('request.submitted') || 'تم إرسال الطلب'}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(selectedRequest.createdAt)}</p>
                  </div>
                </div>

                {/* Supervisor Decision */}
                {selectedRequest.supervisorApproval ? (
                  <div className={`flex items-start gap-3 p-3 rounded-lg ${
                    selectedRequest.supervisorApproval.approved
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
                        {t('request.supervisorDecision') || 'قرار المشرف'}: {' '}
                        {selectedRequest.supervisorApproval.approved
                          ? (t('request.approved') || 'موافق عليه')
                          : (t('request.rejected') || 'مرفوض')
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
                      <p className="text-sm font-medium">{t('request.awaitingSupervisor') || 'في انتظار قرار المشرف'}</p>
                    </div>
                  </div>
                )}

                {/* Committee Decision */}
                {selectedRequest.committeeApproval ? (
                  <div className={`flex items-start gap-3 p-3 rounded-lg ${
                    selectedRequest.committeeApproval.approved
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
                        {t('request.committeeDecision') || 'قرار اللجنة'}: {' '}
                        {selectedRequest.committeeApproval.approved
                          ? (t('request.approved') || 'موافق عليه')
                          : (t('request.rejected') || 'مرفوض')
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
                      <p className="text-sm font-medium">{t('request.awaitingCommittee') || 'في انتظار قرار اللجنة'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <ConfirmDialog
        open={showCancelDialog}
        onClose={() => {
          setShowCancelDialog(false)
          setRequestToCancel(null)
        }}
        onConfirm={handleCancel}
        title={t('request.cancelTitle') || 'إلغاء الطلب'}
        description={t('request.cancelDescription') || 'هل أنت متأكد من إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.'}
        confirmLabel={t('request.cancel') || 'إلغاء الطلب'}
        cancelLabel={t('common.cancel') || 'إلغاء'}
        variant="destructive"
      />
    </>
  )
}



