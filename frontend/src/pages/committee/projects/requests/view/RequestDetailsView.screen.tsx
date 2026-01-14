import { useTranslation } from 'react-i18next'
import { ModalDialog, StatusBadge, LoadingSpinner } from '@/components/common'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle2, XCircle, Clock, User, FileText, Calendar, MessageSquare, Briefcase } from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/lib/utils/format'
import { useRequest } from '../hooks/useRequests'
import type { Request } from '@/types/request.types'

interface RequestDetailsViewProps {
    requestId: string
    open: boolean
    onClose: () => void
}

export function RequestDetailsView({ requestId, open, onClose }: RequestDetailsViewProps) {
    const { t } = useTranslation()
    const { data: request, isLoading, error } = useRequest(requestId)

    if (isLoading) {
        return (
            <ModalDialog open={open} onOpenChange={onClose} title={t('request.requestDetails')} size="xl">
                <div className="flex justify-center py-8">
                    <LoadingSpinner />
                </div>
            </ModalDialog>
        )
    }

    if (error || !request) {
        return (
            <ModalDialog open={open} onOpenChange={onClose} title={t('request.requestDetails')} size="xl">
                <div className="text-center py-8 text-destructive">
                    {t('request.loadError')}
                </div>
            </ModalDialog>
        )
    }

    const getRequestTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            change_supervisor: t('requests.change_supervisor'),
            change_group: t('requests.change_group'),
            change_project: t('requests.change_project'),
            other: t('requests.other'),
        }
        return labels[type] || type
    }

    return (
        <ModalDialog open={open} onOpenChange={onClose} title={t('request.requestDetails')} size="xl">
            <div className="max-w-4xl space-y-4">
                {/* Request Header */}
                <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <StatusBadge status={request.status} />
                        <span className="text-sm text-muted-foreground">
                            {t('request.submittedAt')} {formatRelativeTime(request.createdAt)}
                        </span>
                    </div>
                </div>

                {/* Student Information */}
                {request.student && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                {t('committee.requests.student')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">{t('common.name')}</p>
                                    <p className="text-sm font-medium">{request.student.name}</p>
                                </div>
                                {request.student.email && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">{t('common.email')}</p>
                                        <p className="text-sm">{request.student.email}</p>
                                    </div>
                                )}
                                {request.student.studentId && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">{t('common.studentId')}</p>
                                        <p className="text-sm">{request.student.studentId}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Request Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            {t('request.requestInformation')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">{t('request.type')}</p>
                                <p className="text-sm font-medium">{getRequestTypeLabel(request.type)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">{t('common.status')}</p>
                                <StatusBadge status={request.status} />
                            </div>
                            {request.project && (
                                <div className="md:col-span-2">
                                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                        <Briefcase className="h-3 w-3" />
                                        {t('request.project')}
                                    </p>
                                    <p className="text-sm font-medium">{request.project.title}</p>
                                    {request.project.description && (
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {request.project.description}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {t('request.reason')}
                            </p>
                            <div className="p-3 bg-muted rounded-lg border">
                                <p className="text-sm whitespace-pre-wrap">{request.reason}</p>
                            </div>
                        </div>

                        {request.additionalData && Object.keys(request.additionalData).length > 0 && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                    {t('request.additionalInformation')}
                                </p>
                                <div className="p-3 bg-muted rounded-lg border">
                                    <pre className="text-xs whitespace-pre-wrap">
                                        {JSON.stringify(request.additionalData, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Committee Decision */}
                {request.committeeApproval ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                {request.committeeApproval.approved ? (
                                    <CheckCircle2 className="h-5 w-5 text-success" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-destructive" />
                                )}
                                {t('request.committeeDecision')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`p-3 rounded-lg ${request.committeeApproval.approved
                                ? 'bg-success/10 border border-success/20'
                                : 'bg-destructive/10 border border-destructive/20'
                                }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-sm font-medium ${request.committeeApproval.approved ? 'text-success' : 'text-destructive'
                                        }`}>
                                        {request.committeeApproval.approved
                                            ? t('common.approved')
                                            : t('common.rejected')
                                        }
                                    </span>
                                </div>
                                {request.committeeApproval.comments && (
                                    <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                                        {request.committeeApproval.comments}
                                    </p>
                                )}
                                {request.committeeApproval.approvedAt && (
                                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(request.committeeApproval.approvedAt)}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ) : request.status === 'pending' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="h-5 w-5 text-warning" />
                                {t('request.awaitingDecision')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                                <p className="text-sm text-warning-foreground">
                                    {t('committee.requests.awaitingCommitteeReview')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Timeline */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{t('request.timeline')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {/* Submitted */}
                            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                                <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{t('request.submitted')}</p>
                                    <p className="text-xs text-muted-foreground">{formatDate(request.createdAt)}</p>
                                </div>
                            </div>

                            {/* Committee Decision */}
                            {request.committeeApproval ? (
                                <div className={`flex items-start gap-3 p-3 rounded-lg ${request.committeeApproval.approved
                                    ? 'bg-success/10'
                                    : 'bg-destructive/10'
                                    }`}>
                                    {request.committeeApproval.approved ? (
                                        <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                                    )}
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">
                                            {t('request.committeeDecision')}: {' '}
                                            {request.committeeApproval.approved
                                                ? t('common.approved')
                                                : t('common.rejected')
                                            }
                                        </p>
                                        {request.committeeApproval.comments && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {request.committeeApproval.comments}
                                            </p>
                                        )}
                                        {request.committeeApproval.approvedAt && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatDate(request.committeeApproval.approvedAt)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                                    <Clock className="h-5 w-5 text-warning mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{t('request.awaitingCommittee')}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ModalDialog>
    )
}
