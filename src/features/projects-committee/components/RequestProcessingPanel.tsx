import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePendingRequests, useApproveRequest, useRejectRequest } from '../hooks/useRequestProcessing'
import { requiresSupervisorApproval } from '../../common/utils/requestRouting'
import { Card, CardContent } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Textarea } from '../../../components/ui/textarea'
import { Label } from '../../../components/ui/label'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { EmptyState } from '../../../components/common/EmptyState'
import { useToast } from '../../../components/common/NotificationToast'
import { FileCheck, User, AlertTriangle, CheckCircle2, XCircle, Loader2, MessageSquare } from 'lucide-react'
import { StatusBadge } from '../../../components/common/StatusBadge'
import { formatDate } from '../../../lib/utils/format'

export function RequestProcessingPanel() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const { data: requests, isLoading } = usePendingRequests()
  const approveRequest = useApproveRequest()
  const rejectRequest = useRejectRequest()
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  const [comments, setComments] = useState('')
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)

  const handleAction = async (requestId: string, actionType: 'approve' | 'reject') => {
    try {
      if (actionType === 'approve') {
        await approveRequest.mutateAsync({ id: requestId, comments: comments || undefined })
        showToast(t('committee.requests.approveSuccess') || 'تم قبول الطلب بنجاح', 'success')
      } else {
        await rejectRequest.mutateAsync({ id: requestId, comments: comments || undefined })
        showToast(t('committee.requests.rejectSuccess') || 'تم رفض الطلب بنجاح', 'success')
      }
      setComments('')
      setSelectedRequest(null)
      setAction(null)
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t('committee.requests.processingError') || 'فشل معالجة الطلب',
        'error'
      )
    }
  }

  const getRequestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      change_supervisor: t('requests.change_supervisor') || 'تغيير المشرف',
      change_group: t('requests.change_group') || 'تغيير المجموعة',
      change_project: t('requests.change_project') || 'تغيير المشروع',
      other: t('requests.other') || 'أخرى',
    }
    return labels[type] || type
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!requests || requests.length === 0) {
    return (
      <EmptyState
        icon={FileCheck}
        title={t('committee.requests.noRequests') || 'لا توجد طلبات قيد المعالجة حالياً'}
        description={t('committee.requests.noRequestsDescription') || 'لا توجد طلبات جديدة تحتاج إلى مراجعة'}
      />
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const needsSupervisor = requiresSupervisorApproval(request.type)
        const isFromSupervisor = request.status === 'supervisor_approved'
        const canProcess = request.status === 'pending' || isFromSupervisor

        return (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-primary" />
                      {t('committee.requests.request') || 'طلب'} {getRequestTypeLabel(request.type)}
                    </h3>
                    <StatusBadge status={request.status} />
                  </div>
                  <p className="text-muted-foreground mb-3">{request.reason}</p>

                  <div className="text-sm space-y-2 mb-3">
                    {request.student && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>
                          <span className="font-medium">{t('committee.requests.student') || 'الطالب'}:</span> {request.student.name}
                        </span>
                      </div>
                    )}
                    {request.supervisorApproval && (
                      <div className="mt-2 p-3 bg-info/10 rounded-lg border border-info/20">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="h-4 w-4 text-info" />
                          <p className="font-medium text-info">
                            {t('committee.requests.supervisorDecision') || 'قرار المشرف'}:{' '}
                            <span className={request.supervisorApproval.approved ? 'text-success' : 'text-destructive'}>
                              {request.supervisorApproval.approved 
                                ? (t('common.approved') || 'موافق') 
                                : (t('common.rejected') || 'مرفوض')
                              }
                            </span>
                          </p>
                        </div>
                        {request.supervisorApproval.comments && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {request.supervisorApproval.comments}
                          </p>
                        )}
                        {request.supervisorApproval.approvedAt && (
                          <p className="text-xs text-muted-foreground/80 mt-1">
                            {formatDate(request.supervisorApproval.approvedAt)}
                          </p>
                        )}
                      </div>
                    )}
                    {needsSupervisor && request.status === 'pending' && (
                      <div className="flex items-start gap-2 p-2 bg-warning/10 rounded border border-warning/20">
                        <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                        <p className="text-xs text-warning-foreground">
                          {t('committee.requests.needsSupervisorApproval') || 'هذا الطلب يتطلب موافقة المشرف أولاً'}
                        </p>
                      </div>
                    )}
                    {isFromSupervisor && (
                      <div className="flex items-start gap-2 p-2 bg-info/10 rounded border border-info/20">
                        <CheckCircle2 className="h-4 w-4 text-info mt-0.5 shrink-0" />
                        <p className="text-xs text-info-foreground">
                          {t('committee.requests.supervisorApproved') || 'تمت موافقة المشرف، جاهز لمراجعة اللجنة'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {canProcess && (
                  <>
                    {selectedRequest === request.id && (
                      <div className="space-y-2 p-4 bg-muted rounded-lg border">
                        <Label htmlFor={`comments-${request.id}`}>
                          {t('committee.requests.comments') || 'ملاحظات'} ({t('common.optional') || 'اختياري'})
                        </Label>
                        <Textarea
                          id={`comments-${request.id}`}
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          placeholder={t('committee.requests.commentsPlaceholder') || 'أدخل ملاحظاتك حول القرار'}
                          rows={3}
                        />
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      <Button
                        onClick={() => {
                          setSelectedRequest(request.id)
                          setAction('approve')
                        }}
                        disabled={
                          approveRequest.isPending ||
                          rejectRequest.isPending ||
                          (selectedRequest === request.id && action !== 'approve')
                        }
                        variant="default"
                        className="flex-1"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {t('common.accept') || 'قبول'}
                      </Button>
                      {selectedRequest === request.id && action === 'approve' && (
                        <Button
                          onClick={() => handleAction(request.id, 'approve')}
                          disabled={approveRequest.isPending}
                        >
                          {approveRequest.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t('common.processing')}
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
                          onClick={() => handleAction(request.id, 'reject')}
                          disabled={rejectRequest.isPending}
                          variant="destructive"
                        >
                          {rejectRequest.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t('common.processing')}
                            </>
                          ) : (
                            t('common.confirm') || 'تأكيد الرفض'
                          )}
                        </Button>
                      )}
                    </div>
                  </>
                )}

                {!canProcess && (
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground">
                      {request.status === 'supervisor_rejected' && (t('committee.requests.supervisorRejected') || 'تم رفض الطلب من قبل المشرف')}
                      {request.status === 'committee_approved' && (t('committee.requests.approved') || 'تم قبول الطلب')}
                      {request.status === 'committee_rejected' && (t('committee.requests.rejected') || 'تم رفض الطلب')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

