import { useTranslation } from 'react-i18next'
import { ModalDialog, StatusBadge, LoadingSpinner } from '@/components/common'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle2, XCircle, Clock, User, FileText, Calendar, MessageSquare, Briefcase, Mail, Phone, Building2, IdCard, ClipboardList, Users } from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/lib/utils/format'
import { useRequest } from '../hooks/useRequests'
import { useQuery } from '@tanstack/react-query'
import { registrationService } from '../../registrations/api/registration.service'
import type { ProjectRegistration } from '@/types/project.types'

interface RequestDetailsViewProps {
    requestId: string
    open: boolean
    onClose: () => void
}

export function RequestDetailsView({ requestId, open, onClose }: RequestDetailsViewProps) {
    const { t } = useTranslation()
    const { data: request, isLoading, error } = useRequest(requestId)

    // Fetch student registrations if student is available
    const { data: registrationsData } = useQuery<ProjectRegistration[]>({
        queryKey: ['student-registrations', request?.studentId],
        queryFn: () => {
            if (!request?.studentId) return []
            return registrationService.getByStudentId(request.studentId)
        },
        enabled: !!request?.studentId && !!request,
    })

    const registrations = registrationsData || []

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
        <ModalDialog open={open} onOpenChange={onClose} title={t('request.requestDetails')} size="xl" className="lg:max-w-3xl">
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
                            <CardDescription>
                                {t('committee.requests.studentInformation')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {t('common.name')}
                                    </p>
                                    <p className="text-sm font-medium">{request.student.name}</p>
                                </div>
                                {request.student.studentId && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                            <IdCard className="h-3 w-3" />
                                            {t('common.studentId')}
                                        </p>
                                        <p className="text-sm font-medium">{request.student.studentId}</p>
                                    </div>
                                )}
                                {request.student.email && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            {t('common.email')}
                                        </p>
                                        <p className="text-sm break-all">{request.student.email}</p>
                                    </div>
                                )}
                                {request.student.phone && (
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            {t('common.phone')}
                                        </p>
                                        <p className="text-sm">{request.student.phone}</p>
                                    </div>
                                )}
                                {request.student.department && (
                                    <div className="md:col-span-2">
                                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                            <Building2 className="h-3 w-3" />
                                            {t('common.department')}
                                        </p>
                                        <p className="text-sm">{request.student.department}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">{t('common.status')}</p>
                                    <StatusBadge status={request.student.status} />
                                </div>
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

                        {request.additionalData && Object.keys(request.additionalData).length > 0 && !request.currentGroup && !request.targetGroup && !request.targetProject && (
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

                {/* Change Group: current project, current group, target group (enriched) */}
                {request.type === 'change_group' && (request.currentGroup != null || request.targetGroup != null || request.currentProject) && (
                    <Card className="border-l-4 border-l-purple-500">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                {t('committee.requests.groupChangeDetails')}
                            </CardTitle>
                            <CardDescription>{t('committee.requests.groupChangeDescription')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {request.currentProject && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">{t('committee.requests.projectStudentRegisteredIn', { defaultValue: 'Project student is registered in' })}</p>
                                    <p className="font-medium">{request.currentProject.title}</p>
                                </div>
                            )}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="p-3 rounded-lg bg-muted/50 border space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">{t('request.currentGroup')}</p>
                                    {request.currentGroup ? (
                                        <>
                                            <p className="font-medium">{request.currentGroup.name || request.currentGroup.groupCode || '-'}</p>
                                            {request.currentGroup.groupCode && <p className="text-xs text-muted-foreground">Code: {request.currentGroup.groupCode}</p>}
                                            {request.currentGroup.leader && <p className="text-xs">Leader: {request.currentGroup.leader.name || request.currentGroup.leader.email}</p>}
                                            <p className="text-xs text-muted-foreground">{request.currentGroup.memberCount ?? request.currentGroup.members?.length ?? 0} {t('common.members')}</p>
                                        </>
                                    ) : (
                                        <p className="text-sm">{t('common.notSet')}</p>
                                    )}
                                </div>
                                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 space-y-1">
                                    <p className="text-xs font-medium text-muted-foreground">{t('request.targetGroup')}</p>
                                    {request.targetGroup ? (
                                        <>
                                            <p className="font-medium text-primary">{request.targetGroup.name || request.targetGroup.groupCode || '-'}</p>
                                            {request.targetGroup.groupCode && <p className="text-xs text-muted-foreground">Code: {request.targetGroup.groupCode}</p>}
                                            {request.targetGroup.leader && <p className="text-xs">Leader: {request.targetGroup.leader.name || request.targetGroup.leader.email}</p>}
                                            <p className="text-xs text-muted-foreground">{request.targetGroup.memberCount ?? request.targetGroup.members?.length ?? 0} / {request.targetGroup.maxMembers ?? '-'} {t('common.members')}</p>
                                        </>
                                    ) : (
                                        <p className="text-sm">{t('common.notSet')}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Change Project: current project/group, target project (enriched) */}
                {request.type === 'change_project' && (request.currentProject != null || request.targetProject != null) && (
                    <Card className="border-l-4 border-l-indigo-500">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-primary" />
                                {t('committee.requests.projectChangeDetails', { defaultValue: 'Project change details' })}
                            </CardTitle>
                            <CardDescription>{t('committee.requests.projectChangeDescription', { defaultValue: 'Student requests to move from current project to the target project.' })}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                {request.currentProject && (
                                    <div className="p-3 rounded-lg bg-muted/50 border">
                                        <p className="text-xs font-medium text-muted-foreground mb-1">{t('committee.requests.currentProject', { defaultValue: 'Current project' })}</p>
                                        <p className="font-medium">{request.currentProject.title}</p>
                                        {request.currentProject.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{request.currentProject.description}</p>}
                                    </div>
                                )}
                                {request.currentGroup && (
                                    <div className="p-3 rounded-lg bg-muted/50 border">
                                        <p className="text-xs font-medium text-muted-foreground mb-1">{t('request.currentGroup')}</p>
                                        <p className="font-medium">{request.currentGroup.name || request.currentGroup.groupCode || '-'}</p>
                                        {request.currentGroup.groupCode && <p className="text-xs text-muted-foreground">Code: {request.currentGroup.groupCode}</p>}
                                    </div>
                                )}
                            </div>
                            {request.targetProject && (
                                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                                    <p className="text-xs font-medium text-muted-foreground mb-1">{t('committee.requests.targetProject', { defaultValue: 'Target project' })}</p>
                                    <p className="font-medium text-primary">{request.targetProject.title}</p>
                                    {request.targetProject.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{request.targetProject.description}</p>}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Change Supervisor: note that request was first sent to supervisor */}
                {request.type === 'change_supervisor' && (
                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-4">
                            <p className="text-sm text-muted-foreground">
                                {request.status === 'supervisor_approved'
                                    ? t('committee.requests.supervisorApprovedThenCommittee')
                                    : t('committee.requests.supervisorFirstThenCommittee')}
                            </p>
                        </CardContent>
                    </Card>
                )}

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

                {/* Project Registrations */}
                {request.studentId && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <ClipboardList className="h-5 w-5 text-primary" />
                                {t('committee.requests.projectRegistrations')}
                            </CardTitle>
                            <CardDescription>
                                {t('committee.requests.allStudentRegistrations')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {registrations.length === 0 ? (
                                <div className="text-center py-4 text-muted-foreground">
                                    <p className="text-sm">{t('committee.requests.noRegistrations')}</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {registrations.map((registration) => (
                                        <div
                                            key={registration.id}
                                            className="p-3 border rounded-lg bg-muted/30"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    {registration.project ? (
                                                        <>
                                                            <p className="text-sm font-medium flex items-center gap-2">
                                                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                                                {registration.project.title}
                                                            </p>
                                                            {registration.project.description && (
                                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                                    {registration.project.description}
                                                                </p>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <p className="text-sm font-medium">
                                                            {t('committee.requests.projectId')}: {registration.projectId}
                                                        </p>
                                                    )}
                                                </div>
                                                <StatusBadge status={registration.status} />
                                            </div>
                                            <div className="grid gap-2 md:grid-cols-2 text-xs text-muted-foreground mt-2 pt-2 border-t">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{t('committee.requests.submittedAt')}: {formatDate(registration.submittedAt)}</span>
                                                </div>
                                                {registration.reviewedAt && (
                                                    <div className="flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        <span>{t('committee.requests.reviewedAt')}: {formatDate(registration.reviewedAt)}</span>
                                                    </div>
                                                )}
                                                {registration.reviewComments && (
                                                    <div className="md:col-span-2 mt-1">
                                                        <p className="font-medium text-muted-foreground mb-0.5">
                                                            {t('committee.requests.reviewComments')}:
                                                        </p>
                                                        <p className="text-xs bg-muted p-2 rounded border">
                                                            {registration.reviewComments}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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
