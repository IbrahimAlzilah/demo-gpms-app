import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../app/layouts/MainLayout'
import { RequestSubmissionForm } from '../../features/student/components/RequestSubmissionForm'
import { useRequests, useCancelRequest } from '../../features/student/hooks/useRequests'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { StatusBadge } from '../../components/common/StatusBadge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { FileCheck, Plus, Eye, User, Users, Briefcase, MessageSquare, CheckCircle2, XCircle, Clock, AlertCircle, Loader2, X } from 'lucide-react'
import { formatDate, formatRelativeTime } from '../../lib/utils/format'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import type { Request } from '../../types/request.types'

export function RequestsPage() {
  const { t } = useTranslation()
  const { data: requests, isLoading } = useRequests()
  const cancelRequest = useCancelRequest()
  const [showForm, setShowForm] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState<string | null>(null)

  const getRequestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      change_supervisor: t('request.type.changeSupervisor') || 'تغيير المشرف',
      change_group: t('request.type.changeGroup') || 'تغيير المجموعة',
      change_project: t('request.type.changeProject') || 'تغيير المشروع',
      other: t('request.type.other') || 'طلب آخر',
    }
    return labels[type] || type
  }

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'change_supervisor':
        return <User className="h-4 w-4" />
      case 'change_group':
        return <Users className="h-4 w-4" />
      case 'change_project':
        return <Briefcase className="h-4 w-4" />
      default:
        return <FileCheck className="h-4 w-4" />
    }
  }

  const handleCancel = async (requestId: string) => {
    try {
      await cancelRequest.mutateAsync(requestId)
      setShowCancelDialog(null)
    } catch (err) {
      console.error('Failed to cancel request:', err)
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileCheck className="h-8 w-8 text-primary" />
              {t('nav.requests') || 'الطلبات'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t('request.pageDescription') || 'تقديم طلب رسمي (تغيير مشرف، مجموعة، أو مشروع، إلخ)'}
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto"
          >
            <Plus className="ml-2 h-4 w-4" />
            {showForm ? (t('common.cancel') || 'إلغاء') : (t('request.newRequest') || 'طلب جديد')}
          </Button>
        </div>

        {/* Request Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>{t('request.submitNew') || 'تقديم طلب جديد'}</CardTitle>
              <CardDescription>
                {t('request.submitDescription') || 'املأ النموذج أدناه لتقديم طلبك'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RequestSubmissionForm onSuccess={() => setShowForm(false)} />
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        {requests && requests.length > 0 && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('request.total') || 'المجموع'}</p>
                    <p className="text-2xl font-bold">{requests.length}</p>
                  </div>
                  <FileCheck className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('request.status.pending') || 'معلقة'}</p>
                    <p className="text-2xl font-bold">
                      {requests.filter((r) => r.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-warning" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('request.status.approved') || 'موافق عليها'}</p>
                    <p className="text-2xl font-bold">
                      {requests.filter((r) => r.status === 'committee_approved').length}
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('request.status.rejected') || 'مرفوضة'}</p>
                    <p className="text-2xl font-bold">
                      {requests.filter((r) => r.status === 'committee_rejected' || r.status === 'supervisor_rejected').length}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Requests List */}
        {requests && requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {getRequestTypeIcon(request.type)}
                        <CardTitle>{getRequestTypeLabel(request.type)}</CardTitle>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatRelativeTime(request.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={request.status} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {request.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowCancelDialog(request.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {t('request.reason') || 'السبب'}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{request.reason}</p>
                    </div>
                    {/* Workflow Status */}
                    <div className="flex items-center gap-2 text-xs">
                      {request.supervisorApproval ? (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded ${
                          request.supervisorApproval.approved 
                            ? 'bg-success/10 text-success' 
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          {request.supervisorApproval.approved ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {t('request.supervisorDecision') || 'قرار المشرف'}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {t('request.awaitingSupervisor') || 'في انتظار المشرف'}
                        </div>
                      )}
                      {request.committeeApproval ? (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded ${
                          request.committeeApproval.approved 
                            ? 'bg-success/10 text-success' 
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          {request.committeeApproval.approved ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {t('request.committeeDecision') || 'قرار اللجنة'}
                        </div>
                      ) : request.supervisorApproval?.approved && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {t('request.awaitingCommittee') || 'في انتظار اللجنة'}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileCheck}
            title={t('request.noRequests') || 'لا توجد طلبات'}
            description={t('request.noRequestsDescription') || 'ابدأ بتقديم طلب جديد'}
            action={{
              label: t('request.newRequest') || 'تقديم طلب جديد',
              onClick: () => setShowForm(true),
            }}
          />
        )}

        {/* Request Detail Dialog */}
        {selectedRequest && (
          <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getRequestTypeIcon(selectedRequest.type)}
                  {getRequestTypeLabel(selectedRequest.type)}
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
                    <MessageSquare className="h-4 w-4" />
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

        {/* Cancel Confirmation Dialog */}
        <ConfirmDialog
          open={!!showCancelDialog}
          onClose={() => setShowCancelDialog(null)}
          onConfirm={() => showCancelDialog && handleCancel(showCancelDialog)}
          title={t('request.cancelTitle') || 'إلغاء الطلب'}
          description={t('request.cancelDescription') || 'هل أنت متأكد من إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.'}
          confirmLabel={t('request.cancel') || 'إلغاء الطلب'}
          cancelLabel={t('common.cancel') || 'إلغاء'}
          variant="destructive"
        />
      </div>
    </MainLayout>
  )
}
