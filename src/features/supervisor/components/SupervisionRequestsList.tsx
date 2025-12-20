import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../auth/store/auth.store'
import { useApproveSupervisionRequest, useRejectSupervisionRequest } from '../hooks/useSupervisionRequests'
import type { Request } from '../../../types/request.types'
import { createSupervisionRequestColumns } from './SupervisionRequestTableColumns'
import { useDataTable } from '@/hooks/useDataTable'
import { supervisionService } from '../api/supervision.service'
import { DataTable, Card, CardContent } from '@/components/ui'
import { BlockContent, ConfirmDialog } from '@/components/common'
import { AlertCircle, CheckCircle2, XCircle, AlertTriangle, User, Briefcase, MessageSquare } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/common/NotificationToast'

const MAX_PROJECTS_PER_SUPERVISOR = 5 // This should come from config

export function SupervisionRequestsList() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { showToast } = useToast()
  const approveRequest = useApproveSupervisionRequest()
  const rejectRequest = useRejectSupervisionRequest()
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [comments, setComments] = useState('')
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // In real app, get current project count from API
  const currentProjectCount = 3 // Mock value
  const canAcceptMore = currentProjectCount < MAX_PROJECTS_PER_SUPERVISOR

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
    queryKey: ['supervision-requests-table'],
    queryFn: (params) => supervisionService.getTableData(params, user?.id),
    initialPageSize: 10,
    enableServerSide: true,
  })

  const handleApprove = async () => {
    if (!selectedRequest) return
    if (currentProjectCount >= MAX_PROJECTS_PER_SUPERVISOR) {
      showToast(t('supervision.maxProjectsReached') || `لا يمكن قبول الطلب. الحد الأقصى للمشاريع هو ${MAX_PROJECTS_PER_SUPERVISOR} مشروع`, 'error')
      return
    }

    try {
      await approveRequest.mutateAsync(selectedRequest.id)
      showToast(t('supervision.approveSuccess') || 'تم قبول الطلب بنجاح', 'success')
      setComments('')
      setSelectedRequest(null)
      setAction(null)
      setShowConfirmDialog(false)
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('supervision.approveError') || 'فشل قبول الطلب', 'error')
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return
    try {
      await rejectRequest.mutateAsync({ requestId: selectedRequest.id, comments: comments || undefined })
      showToast(t('supervision.rejectSuccess') || 'تم رفض الطلب بنجاح', 'success')
      setComments('')
      setSelectedRequest(null)
      setAction(null)
      setShowConfirmDialog(false)
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('supervision.rejectError') || 'فشل رفض الطلب', 'error')
    }
  }

  const handleApproveClick = (request: Request) => {
    if (currentProjectCount >= MAX_PROJECTS_PER_SUPERVISOR) {
      showToast(t('supervision.maxProjectsReached') || `لا يمكن قبول الطلب. الحد الأقصى للمشاريع هو ${MAX_PROJECTS_PER_SUPERVISOR} مشروع`, 'error')
      return
    }
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
      createSupervisionRequestColumns({
        onApprove: handleApproveClick,
        onReject: handleRejectClick,
        canAcceptMore,
        rtl,
      }),
    [canAcceptMore, rtl]
  )

  return (
    <>
      {/* Project Count Info */}
      <Card className={canAcceptMore ? 'border-info mb-6' : 'border-warning mb-6'}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                {t('supervision.currentProjects') || 'عدد المشاريع الحالية'}
              </p>
              <p className="text-2xl font-bold">
                {currentProjectCount} / {MAX_PROJECTS_PER_SUPERVISOR}
              </p>
            </div>
            {canAcceptMore ? (
              <CheckCircle2 className="h-8 w-8 text-success" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-warning" />
            )}
          </div>
          {!canAcceptMore && (
            <p className="text-xs text-warning mt-2">
              {t('supervision.maxProjectsReached') || 'تم الوصول إلى الحد الأقصى للمشاريع'}
            </p>
          )}
        </CardContent>
      </Card>

      <BlockContent title={t('nav.supervisionRequests') || 'معالجة طلبات الإشراف'}>
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
          searchPlaceholder={t('supervision.searchPlaceholder') || 'البحث في طلبات الإشراف...'}
          rtl={rtl}
          enableFiltering={true}
          enableViews={true}
          emptyMessage={t('supervision.noRequests') || 'لا توجد طلبات إشراف للمراجعة'}
        />
      </BlockContent>

      {error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('supervision.loadError') || 'حدث خطأ أثناء تحميل طلبات الإشراف'}</span>
          </div>
        </BlockContent>
      )}

      {/* Confirm Dialog with Comments */}
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
            ? (t('supervision.confirmApprove') || 'تأكيد قبول طلب الإشراف')
            : (t('supervision.confirmReject') || 'تأكيد رفض طلب الإشراف')
        }
        description={
          action === 'approve'
            ? (t('supervision.confirmApproveDescription') || 'هل أنت متأكد من قبول هذا طلب الإشراف؟')
            : (t('supervision.confirmRejectDescription') || 'هل أنت متأكد من رفض هذا طلب الإشراف؟')
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
                    <span className="font-medium">{t('supervision.student') || 'الطالب'}:</span> {selectedRequest.student.name}
                  </span>
                </div>
              )}
              {selectedRequest.project && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <span className="font-medium">{t('supervision.project') || 'المشروع'}:</span> {selectedRequest.project.title}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {t('supervision.reason') || 'السبب'}
              </p>
              <p className="text-sm whitespace-pre-wrap">{selectedRequest.reason}</p>
            </div>
            {(action === 'approve' || action === 'reject') && (
              <div className="space-y-2">
                <Label htmlFor="comments">
                  {t('supervision.comments') || 'ملاحظات'} ({t('common.optional') || 'اختياري'})
                </Label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={t('supervision.commentsPlaceholder') || 'أدخل ملاحظاتك حول القرار (اختياري)'}
                  rows={3}
                  className="resize-none"
                />
              </div>
            )}
          </div>
        )}
      </ConfirmDialog>
    </>
  )
}

