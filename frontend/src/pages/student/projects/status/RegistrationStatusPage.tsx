import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge, LoadingSpinner, BlockContent } from '@/components/common'
import {
    Users,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    ArrowRight,
    User
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'
import { useGroupRegistrationRequest } from '../hooks/useGroupRegistrationRequest'
import { useCancelRegistration } from '../hooks/useProjectOperations'
import { useToast } from '@/components/common'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

export function RegistrationStatusPage() {
    const { t } = useTranslation()
    const { toastSuccess, toastError } = useToast()
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const { data: registrationRequest, isLoading } = useGroupRegistrationRequest()
    const cancelRegistration = useCancelRegistration()

    const handleCancel = async () => {
        if (!registrationRequest?.projectRegistrations?.[0]) return

        try {
            await cancelRegistration.mutateAsync(registrationRequest.projectRegistrations[0].id)
            toastSuccess(t('registration.cancelSuccess'))
            queryClient.invalidateQueries({ queryKey: ['student-registration-request'] })
        } catch (err: any) {
            toastError(err?.response?.data?.message || err?.message || t('registration.cancelError'))
        }
    }

    if (isLoading) {
        return (
            <BlockContent title={t('registration.status')}>
                <Card>
                    <CardContent className="pt-6">
                        <LoadingSpinner />
                    </CardContent>
                </Card>
            </BlockContent>
        )
    }

    if (!registrationRequest) {
        return (
            <BlockContent title={t('registration.status')}>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <div className="flex flex-col items-center gap-3">
                                <FileText className="h-12 w-12 text-muted-foreground/50" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">
                                        {t('registration.noRegistrationRequest')}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {t('registration.noRegistrationRequestDescription')}
                                    </p>
                                </div>
                                <Button onClick={() => navigate('/student/projects')} className="mt-4">
                                    <FileText className="h-4 w-4 mr-2" />
                                    {t('registration.browseProjects')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </BlockContent>
        )
    }

    const projectRegistrations = registrationRequest.projectRegistrations || []
    const pendingProjects = projectRegistrations.filter(p => p.status === 'pending')
    const approvedProjects = projectRegistrations.filter(p => p.status === 'approved')
    const rejectedProjects = projectRegistrations.filter(p => p.status === 'rejected')
    const canCancel = registrationRequest.status === 'pending' && pendingProjects.length > 0

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            case 'rejected':
                return <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            case 'cancelled':
                return <XCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            default:
                return <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
            case 'rejected':
                return 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
            case 'cancelled':
                return 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800'
            default:
                return 'bg-muted/50 border-border'
        }
    }

    return (
        <BlockContent title={t('registration.status')}>
            <div className="space-y-6">
                {/* Status Overview Card */}
                <Card className={getStatusColor(registrationRequest.status)}>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    {getStatusIcon(registrationRequest.status)}
                                </div>
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        {t('registration.registrationRequest')}
                                        <StatusBadge status={registrationRequest.status} />
                                    </CardTitle>
                                    <CardDescription>
                                        {t('registration.submittedAt')}: {formatRelativeTime(registrationRequest.submittedAt)}
                                    </CardDescription>
                                </div>
                            </div>
                            {canCancel && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancel}
                                    disabled={cancelRegistration.isPending}
                                >
                                    {cancelRegistration.isPending ? (
                                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <XCircle className="h-4 w-4 mr-2" />
                                    )}
                                    {t('registration.cancel')}
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2 text-sm">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                    {projectRegistrations.length} {t('registration.projects')}
                                </span>
                            </div>
                            {pendingProjects.length > 0 && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-amber-600" />
                                    <span>{pendingProjects.length} {t('registration.pending')}</span>
                                </div>
                            )}
                            {approvedProjects.length > 0 && (
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    <span>{approvedProjects.length} {t('registration.approved')}</span>
                                </div>
                            )}
                            {rejectedProjects.length > 0 && (
                                <div className="flex items-center gap-2 text-sm">
                                    <XCircle className="h-4 w-4 text-rose-600" />
                                    <span>{rejectedProjects.length} {t('registration.rejected')}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Group Information */}
                {registrationRequest.studentGroup && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                {t('registration.groupDetails')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">{t('groups.groupCode')}</p>
                                    <p className="font-medium">{registrationRequest.studentGroup.groupCode || registrationRequest.studentGroup.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">{t('groups.leader')}</p>
                                    <p className="font-medium">{registrationRequest.studentGroup.leader?.name || registrationRequest.submitter?.name}</p>
                                </div>
                            </div>
                            {registrationRequest.studentGroup.members && registrationRequest.studentGroup.members.length > 0 && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">{t('groups.members')}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {registrationRequest.studentGroup.members.map((member) => (
                                            <span key={member.id} className="text-xs bg-muted px-2 py-1 rounded flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                {member.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Projects List */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('registration.projectsInRequest')}</CardTitle>
                        <CardDescription>
                            {t('registration.projectsInRequestDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {projectRegistrations.map((registration) => {
                                const project = registration.project
                                if (!project) return null

                                const isApproved = registration.status === 'approved'
                                const isPending = registration.status === 'pending'
                                const isRejected = registration.status === 'rejected'

                                return (
                                    <div
                                        key={registration.id}
                                        className={`p-4 rounded-lg border transition-colors ${isApproved && 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800'
                                            } ${isRejected && 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-800'
                                            } ${isPending && 'bg-background border-border'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-semibold text-sm">{project.title}</h4>
                                                    <StatusBadge status={registration.status} />
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                                    {project.description}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    {project.supervisor && (
                                                        <div className="flex items-center gap-1">
                                                            <User className="h-3 w-3" />
                                                            <span>{project.supervisor.name}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        <span>{project.currentStudents}/{project.maxStudents}</span>
                                                    </div>
                                                </div>
                                                {registration.reviewComments && (
                                                    <div className="mt-3 p-2 bg-muted/50 rounded text-xs">
                                                        <p className="font-medium mb-1">{t('registration.reviewComments')}:</p>
                                                        <p className="text-muted-foreground">{registration.reviewComments}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Status Messages */}
                {registrationRequest.status === 'approved' && registrationRequest.approvedProject && (
                    <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100 mb-1">
                                        {t('registration.requestApproved')}
                                    </p>
                                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                        {t('registration.approvedProjectMessage', { project: registrationRequest.approvedProject.title })}
                                    </p>
                                    <Button
                                        onClick={() => navigate('/student/follow-up')}
                                        size="sm"
                                        className="mt-3"
                                    >
                                        {t('dashboard.student.followProject')}
                                        <ArrowRight className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {registrationRequest.status === 'rejected' && registrationRequest.reviewComments && (
                    <Card className="bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-rose-900 dark:text-rose-100 mb-1">
                                        {t('registration.requestRejected')}
                                    </p>
                                    <p className="text-xs text-rose-700 dark:text-rose-300">
                                        {registrationRequest.reviewComments}
                                    </p>
                                    <Button
                                        onClick={() => navigate('/student/projects')}
                                        variant="outline"
                                        size="sm"
                                        className="mt-3"
                                    >
                                        {t('registration.browseProjects')}
                                        <ArrowRight className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {registrationRequest.status === 'pending' && (
                    <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                                        {t('registration.pendingReview')}
                                    </p>
                                    <p className="text-xs text-amber-700 dark:text-amber-300">
                                        {t('registration.pendingReviewDescription')}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </BlockContent>
    )
}
