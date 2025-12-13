import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSupervisionRequests, useApproveSupervisionRequest, useRejectSupervisionRequest } from '../hooks/useSupervisionRequests'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Textarea } from '../../../components/ui/textarea'
import { Label } from '../../../components/ui/label'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog'
import { EmptyState } from '../../../components/common/EmptyState'
import { AlertCircle, CheckCircle2, XCircle, User, Briefcase, MessageSquare, Loader2, AlertTriangle, Clock, UserCheck } from 'lucide-react'
import { formatRelativeTime } from '../../../lib/utils/format'
import { ConfirmDialog } from '../../../components/common/ConfirmDialog'

const MAX_PROJECTS_PER_SUPERVISOR = 5 // This should come from config

export function SupervisionRequestsList() {
  const { t } = useTranslation()
  const { data: requests, isLoading } = useSupervisionRequests()
  const approveRequest = useApproveSupervisionRequest()
  const rejectRequest = useRejectSupervisionRequest()
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [comments, setComments] = useState('')
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [error, setError] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [requestToProcess, setRequestToProcess] = useState<string | null>(null)

  // In real app, get current project count from API
  const currentProjectCount = 3 // Mock value
  const canAcceptMore = currentProjectCount < MAX_PROJECTS_PER_SUPERVISOR

  const handleApprove = async (requestId: string) => {
    setError('')
    if (currentProjectCount >= MAX_PROJECTS_PER_SUPERVISOR) {
      setError(t('supervision.maxProjectsReached') || `لا يمكن قبول الطلب. الحد الأقصى للمشاريع هو ${MAX_PROJECTS_PER_SUPERVISOR} مشروع`)
      return
    }

    try {
      await approveRequest.mutateAsync(requestId)
      setComments('')
      setSelectedRequest(null)
      setAction(null)
      setShowConfirmDialog(false)
      setRequestToProcess(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('supervision.approveError') || 'فشل قبول الطلب')
    }
  }

  const handleReject = async (requestId: string) => {
    setError('')
    try {
      await rejectRequest.mutateAsync({ requestId, comments: comments || undefined })
      setComments('')
      setSelectedRequest(null)
      setAction(null)
      setShowConfirmDialog(false)
      setRequestToProcess(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('supervision.rejectError') || 'فشل رفض الطلب')
    }
  }

  const handleApproveClick = (requestId: string) => {
    if (currentProjectCount >= MAX_PROJECTS_PER_SUPERVISOR) {
      setError(t('supervision.maxProjectsReached') || `لا يمكن قبول الطلب. الحد الأقصى للمشاريع هو ${MAX_PROJECTS_PER_SUPERVISOR} مشروع`)
      return
    }
    setRequestToProcess(requestId)
    setAction('approve')
    setShowConfirmDialog(true)
  }

  const handleRejectClick = (requestId: string) => {
    setRequestToProcess(requestId)
    setAction('reject')
    setShowConfirmDialog(true)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (!requests || requests.length === 0) {
    return (
      <EmptyState
        icon={UserCheck}
        title={t('supervision.noRequests') || 'لا توجد طلبات إشراف للمراجعة'}
        description={t('supervision.noRequestsDescription') || 'لا توجد طلبات إشراف جديدة في الوقت الحالي'}
      />
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2 text-destructive">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Count Info */}
      <Card className={canAcceptMore ? 'border-info' : 'border-warning'}>
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

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    {t('supervision.supervisionRequest') || 'طلب إشراف'}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatRelativeTime(request.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {request.student && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t('supervision.student') || 'الطالب'}</p>
                      <p className="text-sm font-medium">{request.student.name}</p>
                    </div>
                  </div>
                )}
                {request.project && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t('supervision.project') || 'المشروع'}</p>
                      <p className="text-sm font-medium">{request.project.title}</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {t('supervision.reason') || 'السبب'}
                </p>
                <p className="text-sm whitespace-pre-wrap">{request.reason}</p>
              </div>

              {selectedRequest === request.id && (
                <div className="space-y-2 p-4 bg-muted rounded-lg border">
                  <Label htmlFor={`comments-${request.id}`}>
                    {t('supervision.comments') || 'ملاحظات'} ({t('common.optional') || 'اختياري'})
                  </Label>
                  <Textarea
                    id={`comments-${request.id}`}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder={t('supervision.commentsPlaceholder') || 'أدخل ملاحظاتك حول القرار (اختياري)'}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => {
                    setSelectedRequest(request.id)
                    setAction('approve')
                  }}
                  disabled={
                    approveRequest.isPending ||
                    rejectRequest.isPending ||
                    (selectedRequest === request.id && action !== 'approve') ||
                    !canAcceptMore
                  }
                  variant="default"
                  className="flex-1"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {t('common.accept') || 'قبول'}
                </Button>
                {selectedRequest === request.id && action === 'approve' && (
                  <Button
                    onClick={() => handleApproveClick(request.id)}
                    disabled={approveRequest.isPending || !canAcceptMore}
                    className="flex-1"
                  >
                    {approveRequest.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('common.processing') || 'جاري المعالجة...'}
                      </>
                    ) : (
                      t('common.confirm') || 'تأكيد القبول'
                    )}
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setSelectedRequest(request.id)
                    setAction('reject')
                  }}
                  disabled={
                    approveRequest.isPending ||
                    rejectRequest.isPending ||
                    (selectedRequest === request.id && action !== 'reject')
                  }
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  {t('common.reject') || 'رفض'}
                </Button>
                {selectedRequest === request.id && action === 'reject' && (
                  <Button
                    onClick={() => handleRejectClick(request.id)}
                    disabled={rejectRequest.isPending}
                    variant="destructive"
                    className="flex-1"
                  >
                    {rejectRequest.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('common.processing') || 'جاري المعالجة...'}
                      </>
                    ) : (
                      t('common.confirm') || 'تأكيد الرفض'
                    )}
                  </Button>
                )}
              </div>

              {!canAcceptMore && (
                <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                  <p className="text-xs text-warning-foreground">
                    {t('supervision.maxProjectsReached') || `تم الوصول إلى الحد الأقصى للمشاريع (${MAX_PROJECTS_PER_SUPERVISOR})`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false)
          setRequestToProcess(null)
          setAction(null)
        }}
        onConfirm={() => {
          if (requestToProcess) {
            if (action === 'approve') {
              handleApprove(requestToProcess)
            } else if (action === 'reject') {
              handleReject(requestToProcess)
            }
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
      />
    </div>
  )
}

