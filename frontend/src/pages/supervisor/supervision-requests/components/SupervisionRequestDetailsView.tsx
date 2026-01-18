import { ModalDialog, StatusBadge } from '@/components/common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Briefcase,
    FileText,
    Calendar,
    Users,
    Tag,
    User,
    CheckCircle2,
    XCircle,
    MessageSquare,
    Building2,
    Mail,
    IdCard
} from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/lib/utils/format'
import { useTranslation } from 'react-i18next'
import type { Project } from '@/types/project.types'

interface SupervisionRequestDetailsViewProps {
    request: Project | null
    open: boolean
    onClose: () => void
}

export function SupervisionRequestDetailsView({
    request,
    open,
    onClose,
}: SupervisionRequestDetailsViewProps) {
    const { t } = useTranslation()

    if (!open || !request) {
        return null
    }

    const getStatusLabel = (status?: string) => {
        if (!status) return t('common.pending')
        const labels: Record<string, string> = {
            pending: t('common.pending'),
            approved: t('common.approved'),
            rejected: t('common.rejected'),
        }
        return labels[status] || status
    }

    return (
        <ModalDialog
            open={open}
            onOpenChange={onClose}
            title={request.title}
            size="xl"
        >
            <div className="space-y-4">
                {/* Status and Dates */}
                <div className="flex items-center gap-4 text-sm pb-4 border-b">
                    <StatusBadge status={request.supervisorApprovalStatus || 'pending'} />
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{t('supervision.assignedAt')}: {formatRelativeTime(request.createdAt)}</span>
                    </div>
                    {request.supervisorApprovalAt && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{t('supervision.approvedAt')}: {formatDate(request.supervisorApprovalAt)}</span>
                        </div>
                    )}
                </div>

                {/* Project Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-primary" />
                            {t('supervision.projectTitle')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-lg mb-2">{request.title}</h3>
                        </div>

                        {request.description && (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <h4 className="text-sm font-semibold">{t('supervision.description')}</h4>
                                </div>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-3 rounded border">
                                    {request.description}
                                </p>
                            </div>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            {request.specialization && (
                                <div className="flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <span className="text-xs font-medium text-muted-foreground">{t('supervision.specialization')}: </span>
                                        <span className="text-sm">{request.specialization}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <span className="text-xs font-medium text-muted-foreground">{t('supervision.maxStudents')}: </span>
                                    <span className="text-sm">{request.maxStudents}</span>
                                </div>
                            </div>

                            {request.currentStudents !== undefined && (
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <span className="text-xs font-medium text-muted-foreground">{t('supervision.currentStudents')}: </span>
                                        <span className="text-sm">{request.currentStudents}</span>
                                    </div>
                                </div>
                            )}

                            {request.status && (
                                <div className="flex items-center gap-2">
                                    <StatusBadge status={request.status} />
                                </div>
                            )}
                        </div>

                        {request.keywords && request.keywords.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Tag className="h-4 w-4 text-muted-foreground" />
                                    <h4 className="text-sm font-semibold">{t('project.keywords')}</h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {request.keywords.map((keyword, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md border border-primary/20"
                                        >
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Students Information */}
                {request.students && request.students.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                {t('project.students')} ({request.students.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {request.students.map((student) => (
                                    <div key={student.id} className="p-3 rounded-lg bg-muted border border-muted-foreground/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{student.name}</span>
                                        </div>
                                        <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                                            {student.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-3 w-3" />
                                                    <span>{student.email}</span>
                                                </div>
                                            )}
                                            {student.studentId && (
                                                <div className="flex items-center gap-2">
                                                    <IdCard className="h-3 w-3" />
                                                    <span>{t('common.studentId')}: {student.studentId}</span>
                                                </div>
                                            )}
                                            {student.department && (
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-3 w-3" />
                                                    <span>{student.department}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Approval Information */}
                {request.supervisorApprovalStatus && request.supervisorApprovalStatus !== 'pending' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                {request.supervisorApprovalStatus === 'approved' ? (
                                    <CheckCircle2 className="h-5 w-5 text-success" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-destructive" />
                                )}
                                {t('supervision.approvalInformation')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2">
                                <StatusBadge status={request.supervisorApprovalStatus} />
                                <span className="text-sm text-muted-foreground">
                                    {getStatusLabel(request.supervisorApprovalStatus)}
                                </span>
                            </div>

                            {request.supervisorApprovalComments && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                        <h4 className="text-sm font-semibold">{t('supervision.comments')}</h4>
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded border">
                                        {request.supervisorApprovalComments}
                                    </p>
                                </div>
                            )}

                            {request.supervisorApprovalAt && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        {request.supervisorApprovalStatus === 'approved'
                                            ? t('supervision.approvedAt')
                                            : t('supervision.rejectedAt')}: {formatDate(request.supervisorApprovalAt)}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </ModalDialog>
    )
}
