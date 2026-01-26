import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@/components/ui'
import { LoadingSpinner, StatusBadge } from '@/components/common'
import { UserPlus, Clock, X, Loader2 } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'
import { useMyJoinRequests, useCancelJoinRequest } from '../hooks/useGroupOperations'
import { useToast } from '@/components/common'
import { ConfirmDialog } from '@/components/common'
import { useState } from 'react'
import type { GroupJoinRequest } from '@/types/project.types'

export function MyJoinRequestsList() {
    const { t } = useTranslation()
    const { toastSuccess, toastError } = useToast()
    const { data: joinRequests, isLoading } = useMyJoinRequests()
    const cancelRequest = useCancelJoinRequest()
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
    const [requestToCancel, setRequestToCancel] = useState<GroupJoinRequest | null>(null)

    const handleCancelClick = (request: GroupJoinRequest) => {
        setRequestToCancel(request)
        setCancelDialogOpen(true)
    }

    const handleCancelConfirm = async () => {
        if (!requestToCancel) return

        try {
            await cancelRequest.mutateAsync(requestToCancel.id)
            toastSuccess(t('groups.joinRequestCancelled', { defaultValue: 'Join request cancelled successfully' }))
            setCancelDialogOpen(false)
            setRequestToCancel(null)
        } catch (err) {
            toastError(err instanceof Error ? err.message : t('groups.cancelRequestError', { defaultValue: 'Failed to cancel join request' }))
        }
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

    if (!joinRequests || joinRequests.length === 0) {
        return null
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-primary" />
                        {t('groups.myJoinRequests', { defaultValue: 'My Join Requests' })}
                    </CardTitle>
                    <CardDescription>
                        {t('groups.myJoinRequestsDescription', { defaultValue: 'Requests you have sent to join groups' })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {joinRequests.map((request: GroupJoinRequest) => {
                            const isPending = request.status === 'pending'
                            const isApproved = request.status === 'approved'
                            const isRejected = request.status === 'rejected'

                            return (
                                <div
                                    key={request.id}
                                    className={`flex items-start gap-3 p-4 rounded-lg border ${isPending
                                            ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                                            : isApproved
                                                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                                                : isRejected
                                                    ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
                                                    : 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800'
                                        }`}
                                >
                                    <UserPlus className={`h-5 w-5 mt-0.5 shrink-0 ${isPending
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : isApproved
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : isRejected
                                                    ? 'text-rose-600 dark:text-rose-400'
                                                    : 'text-gray-600 dark:text-gray-400'
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-medium text-sm">
                                                {request.group?.name || request.group?.groupCode || t('groups.unknownGroup', { defaultValue: 'Unknown Group' })}
                                            </p>
                                            <StatusBadge status={request.status} />
                                        </div>
                                        {request.group?.leader && (
                                            <p className="text-xs text-muted-foreground mb-1">
                                                {t('groups.groupLeader', { defaultValue: 'Group Leader' })}: {request.group.leader.name}
                                            </p>
                                        )}
                                        {request.message && (
                                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{request.message}</p>
                                        )}
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>
                                                    {t('groups.requestedAt', { defaultValue: 'Requested' })}: {formatRelativeTime(request.requestedAt)}
                                                </span>
                                            </div>
                                            {request.reviewedAt && (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>
                                                        {isApproved
                                                            ? t('groups.approvedAt', { defaultValue: 'Approved' })
                                                            : isRejected
                                                                ? t('groups.rejectedAt', { defaultValue: 'Rejected' })
                                                                : ''}: {formatRelativeTime(request.reviewedAt)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        {request.reviewComments && (
                                            <p className="text-xs text-muted-foreground mt-2 italic">
                                                {t('groups.reviewComments', { defaultValue: 'Comments' })}: {request.reviewComments}
                                            </p>
                                        )}
                                    </div>
                                    {isPending && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleCancelClick(request)}
                                            disabled={cancelRequest.isPending}
                                            className="border-destructive text-destructive hover:bg-destructive/10 shrink-0"
                                        >
                                            {cancelRequest.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <X className="mr-1 h-4 w-4" />
                                                    {t('common.cancel')}
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            <ConfirmDialog
                open={cancelDialogOpen}
                onOpenChange={setCancelDialogOpen}
                onConfirm={handleCancelConfirm}
                title={t('groups.cancelJoinRequest', { defaultValue: 'Cancel Join Request' })}
                description={t('groups.confirmCancelJoinRequest', {
                    defaultValue: 'Are you sure you want to cancel this join request? This action cannot be undone.'
                })}
                variant="destructive"
                confirmLabel={t('common.cancel')}
            />
        </>
    )
}
