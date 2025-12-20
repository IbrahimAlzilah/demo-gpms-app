import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useApproveRequest, useRejectRequest } from '../hooks/useRequestProcessing'
import { requiresSupervisorApproval } from '../../common/utils/requestRouting'
import type { Request } from '../../../types/request.types'
import { createRequestProcessingColumns } from './RequestProcessingTableColumns'
import { useDataTable } from '@/hooks/useDataTable'
import { committeeRequestService } from '../api/request.service'
import { DataTable } from '@/components/ui'
import { BlockContent, ConfirmDialog } from '@/components/common'
import { AlertCircle, User, Briefcase, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/common/NotificationToast'

export function RequestProcessingPanel() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const approveRequest = useApproveRequest()
  const rejectRequest = useRejectRequest()
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [comments, setComments] = useState('')
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

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
    queryKey: ['committee-requests-table'],
    queryFn: (params) => committeeRequestService.getTableData(params),
    initialPageSize: 10,
    enableServerSide: true,
  })

  const handleApprove = async () => {
    if (!selectedRequest) return
    try {
      await approveRequest.mutateAsync({ id: selectedRequest.id, comments: comments || undefined })
      showToast(t('committee.requests.approveSuccess') || 'تم قبول الطلب بنجاح', 'success')
      setComments('')
      setSelectedRequest(null)
      setAction(null)
      setShowConfirmDialog(false)
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t('committee.requests.processingError') || 'فشل معالجة الطلب',
        'error'
      )
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return
    try {
      await rejectRequest.mutateAsync({ id: selectedRequest.id, comments: comments || undefined })
      showToast(t('committee.requests.rejectSuccess') || 'تم رفض الطلب بنجاح', 'success')
      setComments('')
      setSelectedRequest(null)
      setAction(null)
      setShowConfirmDialog(false)
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t('committee.requests.processingError') || 'فشل معالجة الطلب',
        'error'
      )
    }
  }

  const handleApproveClick = (request: Request) => {
    setSelectedRequest(request)
    setAction('approve')
    setShowConfirmDialog(true)
  }

  const handleRejectClick = (request: Request) => {
    setSelectedRequest(request)
    setAction('reject')
    setShowConfirmDialog(true)
  }

  const columns = useMemo(
    () =>
      createRequestProcessingColumns({
        onApprove: handleApproveClick,
        onReject: handleRejectClick,
        rtl,
      }),
    [rtl]
  )

  return (
    <>
      <BlockContent title={t('nav.processRequests') || 'معالجة الطلبات'}>
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
          searchPlaceholder={t('committee.requests.searchPlaceholder') || 'البحث في الطلبات...'}
          rtl={rtl}
          enableFiltering={true}
          enableViews={true}
          emptyMessage={t('committee.requests.noRequests') || 'لا توجد طلبات قيد المعالجة حالياً'}
        />
      </BlockContent>

      {error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('committee.requests.loadError') || 'حدث خطأ أثناء تحميل الطلبات'}</span>
          </div>
        </BlockContent>
      )}

      <ConfirmDialog
        open={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false)
          setSelectedRequest(null)
          setAction(null)
          setComments('')
        }}
        onConfirm={() => {
          if (action === 'approve') {
            handleApprove()
          } else if (action === 'reject') {
            handleReject()
          }
        }}
        title={
          action === 'approve'
            ? (t('committee.requests.confirmApprove') || 'تأكيد قبول الطلب')
            : (t('committee.requests.confirmReject') || 'تأكيد رفض الطلب')
        }
        description={
          action === 'approve'
            ? (t('committee.requests.confirmApproveDescription') || 'هل أنت متأكد من قبول هذا الطلب؟')
            : (t('committee.requests.confirmRejectDescription') || 'هل أنت متأكد من رفض هذا الطلب؟')
        }
        confirmLabel={t('common.confirm') || 'تأكيد'}
        cancelLabel={t('common.cancel') || 'إلغاء'}
        variant={action === 'reject' ? 'destructive' : 'default'}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="text-sm space-y-2">
              {selectedRequest.student && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <span className="font-medium">{t('committee.requests.student') || 'الطالب'}:</span> {selectedRequest.student.name}
                  </span>
                </div>
              )}
              {selectedRequest.supervisorApproval && (
                <div className="mt-2 p-3 bg-info/10 rounded-lg border border-info/20">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="h-4 w-4 text-info" />
                    <p className="font-medium text-info">
                      {t('committee.requests.supervisorDecision') || 'قرار المشرف'}:{' '}
                      <span className={selectedRequest.supervisorApproval.approved ? 'text-success' : 'text-destructive'}>
                        {selectedRequest.supervisorApproval.approved 
                          ? (t('common.approved') || 'موافق') 
                          : (t('common.rejected') || 'مرفوض')
                        }
                      </span>
                    </p>
                  </div>
                  {selectedRequest.supervisorApproval.comments && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {selectedRequest.supervisorApproval.comments}
                    </p>
                  )}
                </div>
              )}
              {requiresSupervisorApproval(selectedRequest.type) && selectedRequest.status === 'pending' && (
                <div className="flex items-start gap-2 p-2 bg-warning/10 rounded border border-warning/20">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                  <p className="text-xs text-warning-foreground">
                    {t('committee.requests.needsSupervisorApproval') || 'هذا الطلب يتطلب موافقة المشرف أولاً'}
                  </p>
                </div>
              )}
              {selectedRequest.status === 'supervisor_approved' && (
                <div className="flex items-start gap-2 p-2 bg-info/10 rounded border border-info/20">
                  <CheckCircle2 className="h-4 w-4 text-info mt-0.5 shrink-0" />
                  <p className="text-xs text-info-foreground">
                    {t('committee.requests.supervisorApproved') || 'تمت موافقة المشرف، جاهز لمراجعة اللجنة'}
                  </p>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {t('request.reason') || 'السبب'}
              </p>
              <p className="text-sm whitespace-pre-wrap">{selectedRequest.reason}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comments">
                {t('committee.requests.comments') || 'ملاحظات'} ({t('common.optional') || 'اختياري'})
              </Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={t('committee.requests.commentsPlaceholder') || 'أدخل ملاحظاتك حول القرار'}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        )}
      </ConfirmDialog>
    </>
  )
}

