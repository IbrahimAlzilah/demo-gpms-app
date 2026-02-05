import { useTranslation } from 'react-i18next'
import { ModalDialog, StatusBadge, LoadingSpinner } from '@/components/common'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, Textarea, Label, Separator } from '@/components/ui'
import {
    CheckCircle2,
    XCircle,
    User,
    FileText,
    MessageSquare,
    Briefcase,
    Mail,
    Phone,
    Building2,
    IdCard,
    Users,
    ArrowRight,
    AlertCircle,
    Type,
    Loader2,
    Eye,
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'
import { useRequest } from '../hooks/useRequests'
import { useState } from 'react'

interface ProcessRequestModalProps {
    requestId: string
    open: boolean
    onClose: () => void
    onApprove: (comments: string) => Promise<void>
    onReject: (comments: string) => Promise<void>
    isProcessing?: boolean
    /** If provided, shows a "View full details" link that closes the modal and opens the full request view. */
    onViewFullDetails?: () => void
}

export function ProcessRequestModal({
    requestId,
    open,
    onClose,
    onApprove,
    onReject,
    isProcessing = false,
    onViewFullDetails,
}: ProcessRequestModalProps) {
    const { t } = useTranslation()
    const { data: request, isLoading, error } = useRequest(requestId)
    const [comments, setComments] = useState('')
    const [action, setAction] = useState<'approve' | 'reject' | null>(null)

    const handleApprove = async () => {
        setAction('approve')
        try {
            await onApprove(comments)
            setComments('')
            setAction(null)
        } catch {
            setAction(null)
        }
    }

    const handleReject = async () => {
        setAction('reject')
        try {
            await onReject(comments)
            setComments('')
            setAction(null)
        } catch {
            setAction(null)
        }
    }

    const getRequestTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            change_supervisor: t('requests.change_supervisor'),
            change_group: t('requests.change_group'),
            change_project: t('requests.change_project'),
            change_project_title: t('requests.change_project_title'),
            other: t('requests.other'),
        }
        return labels[type] || type
    }

    const getRequestTypeIcon = (type: string) => {
        switch (type) {
            case 'change_supervisor':
                return <User className="h-5 w-5 text-primary" />
            case 'change_group':
                return <Users className="h-5 w-5 text-primary" />
            case 'change_project':
                return <Briefcase className="h-5 w-5 text-primary" />
            case 'change_project_title':
                return <Type className="h-5 w-5 text-primary" />
            default:
                return <FileText className="h-5 w-5 text-primary" />
        }
    }

    if (isLoading) {
        return (
            <ModalDialog
                open={open}
                onOpenChange={onClose}
                title={t('committee.requests.processRequest')}
                size="xl"
            >
                <div className="flex justify-center py-8">
                    <LoadingSpinner />
                </div>
            </ModalDialog>
        )
    }

    if (error || !request) {
        return (
            <ModalDialog
                open={open}
                onOpenChange={onClose}
                title={t('committee.requests.processRequest')}
                size="xl"
            >
                <div className="text-center py-8 text-destructive">
                    {t('request.loadError')}
                </div>
            </ModalDialog>
        )
    }

    return (
        <ModalDialog
            open={open}
            onOpenChange={onClose}
            title={t('committee.requests.processRequest')}
            size="xl"
            className="lg:max-w-3xl"
        >
            <div className="space-y-5">
                {/* View full details link */}
                {onViewFullDetails && (
                    <div className="flex justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => {
                                onClose()
                                onViewFullDetails()
                            }}
                            disabled={isProcessing}
                        >
                            <Eye className="h-4 w-4 mr-1.5" />
                            {t('committee.requests.viewFullDetails', { defaultValue: 'View full request details' })}
                        </Button>
                    </div>
                )}

                {/* Request Type Header with Status */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl border">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-lg">
                            {getRequestTypeIcon(request.type)}
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">{getRequestTypeLabel(request.type)}</h3>
                            <p className="text-xs text-muted-foreground">
                                {t('request.submittedAt')} {formatRelativeTime(request.createdAt)}
                            </p>
                        </div>
                    </div>
                    <StatusBadge status={request.status} />
                </div>

                {/* Key Information Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Student Card */}
                    {request.student && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    {t('committee.requests.student')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="font-semibold text-base">{request.student.name}</p>
                                {request.student.studentId && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <IdCard className="h-3.5 w-3.5" />
                                        <span>{request.student.studentId}</span>
                                    </div>
                                )}
                                {request.student.email && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="h-3.5 w-3.5" />
                                        <span className="truncate">{request.student.email}</span>
                                    </div>
                                )}
                                {request.student.phone && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="h-3.5 w-3.5" />
                                        <span>{request.student.phone}</span>
                                    </div>
                                )}
                                {request.student.department && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Building2 className="h-3.5 w-3.5" />
                                        <span>{request.student.department}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Project/Context Card - current registration (or request.project) */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                                <Briefcase className="h-4 w-4" />
                                {request.currentProject ? t('committee.requests.currentProject', { defaultValue: 'Current project' }) : t('request.project')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {(request.currentProject ?? request.project) ? (
                                <div className="space-y-2">
                                    <p className="font-semibold text-base">{(request.currentProject ?? request.project)!.title}</p>
                                    {(request.currentProject ?? request.project)!.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {(request.currentProject ?? request.project)!.description}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">{t('common.notSet')}</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Change Group: current project, current group, target group (enriched or fallback) */}
                {request.type === 'change_group' && (request.currentGroup != null || request.targetGroup != null || request.additionalData) && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                                <Users className="h-4 w-4" />
                                {t('committee.requests.groupChangeDetails')}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('committee.requests.groupChangeDescription')}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {request.currentProject && (
                                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                                    <p className="text-xs font-medium text-muted-foreground mb-1">{t('committee.requests.projectStudentRegisteredIn', { defaultValue: 'Project student is registered in' })}</p>
                                    <p className="font-semibold">{request.currentProject.title}</p>
                                </div>
                            )}
                            <div className="flex flex-wrap items-stretch gap-4">
                                <div className="flex-1 min-w-[200px] p-4 rounded-lg bg-muted/50 border border-border/50 space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground">{t('request.currentGroup')}</p>
                                    {request.currentGroup ? (
                                        <>
                                            <p className="font-semibold">{request.currentGroup.name || request.currentGroup.groupCode || '-'}</p>
                                            <p className="text-xs text-muted-foreground">{request.currentGroup.groupCode && `Code: ${request.currentGroup.groupCode}`}</p>
                                            {request.currentGroup.leader && (
                                                <p className="text-xs">Leader: {request.currentGroup.leader.name || request.currentGroup.leader.email}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                {request.currentGroup.memberCount ?? request.currentGroup.members?.length ?? 0} {t('common.members')}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-sm">
                                            {String(
                                                request.additionalData?.previous_group_code
                                                ?? request.additionalData?.previousGroupCode
                                                ?? request.additionalData?.current_group_code
                                                ?? request.additionalData?.currentGroupCode
                                                ?? t('request.myGroup')
                                            )}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center shrink-0">
                                    <ArrowRight className="h-5 w-5 text-muted-foreground" aria-hidden />
                                </div>
                                <div className="flex-1 min-w-[200px] p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground">{t('request.targetGroup')}</p>
                                    {request.targetGroup ? (
                                        <>
                                            <p className="font-semibold text-primary">{request.targetGroup.name || request.targetGroup.groupCode || '-'}</p>
                                            <p className="text-xs text-muted-foreground">{request.targetGroup.groupCode && `Code: ${request.targetGroup.groupCode}`}</p>
                                            {request.targetGroup.leader && (
                                                <p className="text-xs">Leader: {request.targetGroup.leader.name || request.targetGroup.leader.email}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                {request.targetGroup.memberCount ?? request.targetGroup.members?.length ?? 0} / {request.targetGroup.maxMembers ?? '-'} {t('common.members')}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="font-medium text-primary">
                                            {String(
                                                request.additionalData?.target_group_code
                                                ?? request.additionalData?.targetGroupCode
                                                ?? request.additionalData?.targetGroupId
                                                ?? request.additionalData?.target_group_id
                                                ?? t('common.notSet')
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Change Project: current project/group, target project (enriched) */}
                {request.type === 'change_project' && (request.currentGroup != null || request.currentProject != null || request.targetProject != null) && (
                    <Card className="border-l-4 border-l-indigo-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                                <Briefcase className="h-4 w-4" />
                                {t('committee.requests.projectChangeDetails', { defaultValue: 'Project change details' })}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('committee.requests.projectChangeDescription', { defaultValue: 'Student requests to move from current project to the target project.' })}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="p-4 rounded-lg bg-muted/50 border border-border/50 space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground">{t('committee.requests.currentProject', { defaultValue: 'Current project' })}</p>
                                    {request.currentProject ? (
                                        <>
                                            <p className="font-semibold">{request.currentProject.title}</p>
                                            {request.currentProject.description && (
                                                <p className="text-xs text-muted-foreground line-clamp-2">{request.currentProject.description}</p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-sm">{t('common.notSet')}</p>
                                    )}
                                </div>
                                <div className="p-4 rounded-lg bg-muted/50 border border-border/50 space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground">{t('request.currentGroup')}</p>
                                    {request.currentGroup ? (
                                        <>
                                            <p className="font-semibold">{request.currentGroup.name || request.currentGroup.groupCode || '-'}</p>
                                            <p className="text-xs text-muted-foreground">{request.currentGroup.groupCode && `Code: ${request.currentGroup.groupCode}`}</p>
                                        </>
                                    ) : (
                                        <p className="text-sm">{t('common.notSet')}</p>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                                <p className="text-xs font-medium text-muted-foreground mb-1">{t('committee.requests.targetProject', { defaultValue: 'Target project' })}</p>
                                {request.targetProject ? (
                                    <>
                                        <p className="font-semibold text-primary">{request.targetProject.title}</p>
                                        {request.targetProject.description && (
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{request.targetProject.description}</p>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-sm">{t('common.notSet')}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {request.type === 'change_supervisor' && request.additionalData && (
                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                                <User className="h-4 w-4" />
                                {t('committee.requests.supervisorChangeDetails')}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                                {request.status === 'supervisor_approved'
                                    ? t('committee.requests.supervisorApprovedThenCommittee', { defaultValue: 'The current supervisor has approved this request. Committee decision is required.' })
                                    : t('committee.requests.supervisorFirstThenCommittee', { defaultValue: 'Change supervisor requests are first sent to the current supervisor; after approval, they are forwarded to the Committee.' })}
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 p-3 bg-muted/50 rounded-lg text-center">
                                    <p className="text-xs text-muted-foreground mb-1">{t('request.currentSupervisor')}</p>
                                    <p className="font-medium">{String(request.additionalData.currentSupervisorName || t('common.notSet'))}</p>
                                </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
                                <div className="flex-1 p-3 bg-primary/10 rounded-lg text-center border border-primary/20">
                                    <p className="text-xs text-muted-foreground mb-1">{t('request.proposedSupervisor')}</p>
                                    <p className="font-medium text-primary">
                                        {String(request.additionalData.proposedSupervisorName || request.additionalData.proposedSupervisorId || t('common.notSet'))}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {request.type === 'change_project_title' && request.additionalData?.title && (
                    <Card className="border-l-4 border-l-orange-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                                <Type className="h-4 w-4" />
                                {t('committee.requests.newProjectTitle')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium text-base">{String(request.additionalData.title)}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Reason Card */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                            <MessageSquare className="h-4 w-4" />
                            {t('request.reason')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="p-3 bg-muted/50 rounded-lg border">
                            <p className="text-sm whitespace-pre-wrap">{request.reason}</p>
                        </div>
                    </CardContent>
                </Card>

                <Separator />

                {/* Committee Decision Section */}
                <div className="space-y-3">
                    <Label htmlFor="committee-comments" className="text-sm font-medium flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        {t('committee.requests.comments')}
                        <span className="text-muted-foreground font-normal">({t('common.optional')})</span>
                    </Label>
                    <Textarea
                        id="committee-comments"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder={t('committee.requests.commentsPlaceholder')}
                        rows={3}
                        className="resize-none"
                        disabled={isProcessing}
                    />
                </div>

                {/* Status Warning */}
                {request.status !== 'pending' && request.status !== 'supervisor_approved' && (
                    <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg border border-warning/20">
                        <AlertCircle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                        <p className="text-sm text-warning-foreground">
                            {t('committee.requests.requestAlreadyProcessed')}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isProcessing}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleReject}
                        disabled={isProcessing || (request.status !== 'pending' && request.status !== 'supervisor_approved')}
                        className="min-w-[120px]"
                    >
                        {action === 'reject' && isProcessing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                {t('common.processing')}
                            </>
                        ) : (
                            <>
                                <XCircle className="h-4 w-4 mr-2" />
                                {t('common.reject')}
                            </>
                        )}
                    </Button>
                    <Button
                        variant="default"
                        onClick={handleApprove}
                        disabled={isProcessing || (request.status !== 'pending' && request.status !== 'supervisor_approved')}
                        className="min-w-[120px] bg-success hover:bg-success/90"
                    >
                        {action === 'approve' && isProcessing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                {t('common.processing')}
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                {t('common.approve')}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </ModalDialog>
    )
}
