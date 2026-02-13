import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button } from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { UserPlus, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'
import { useApproveJoinRequest, useRejectJoinRequest } from '../hooks/useGroupOperations'
import type { ProjectGroup, StudentGroup, GroupJoinRequest } from '@/types/project.types'
import { useGroupJoinRequests } from '../hooks/useGroups'

interface GroupJoinRequestsListProps {
  group: ProjectGroup | StudentGroup
  requests?: GroupJoinRequest[]
  isLoading?: boolean
  joinCount?: number
  onError?: (error: string) => void
  onSuccess?: (message: string) => void
}

export function GroupJoinRequestsList({
  group,
  requests: promptRequests,
  isLoading: promptLoading,
  joinCount = 0,
  onError,
  onSuccess,
}: GroupJoinRequestsListProps) {
  const { t } = useTranslation()
  const approveRequest = useApproveJoinRequest()
  const rejectRequest = useRejectJoinRequest()

  const { data: fetchedRequests, isLoading: isFetching } = useGroupJoinRequests(promptRequests ? undefined : group.id)

  const joinRequests = promptRequests || fetchedRequests
  const isLoading = promptLoading !== undefined ? promptLoading : isFetching

  const handleApprove = async (requestId: string) => {
    try {
      await approveRequest.mutateAsync(requestId)
      onSuccess?.(t('groups.joinRequestApproved'))
    } catch (err) {
      onError?.(err instanceof Error ? err.message : t('groups.approveRequestError'))
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      await rejectRequest.mutateAsync({ requestId })
      onSuccess?.(t('groups.joinRequestRejected'))
    } catch (err) {
      onError?.(err instanceof Error ? err.message : t('groups.rejectRequestError'))
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

  const pendingRequests = joinRequests?.filter((r) => r.status === 'pending') || []
  const memberCount = group.memberCount ?? group.members?.length ?? 0
  const maxMembers = group.maxMembers ?? 5
  const isGroupFull = memberCount >= maxMembers

  if (pendingRequests.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            {t('groups.joinRequests')}
          </CardTitle>
          <CardDescription>
            {isGroupFull
              ? t('groups.groupFullCannotAccept')
              : t('groups.joinRequestsDescription', { count: pendingRequests.length })}
          </CardDescription>
        </div>
        <Badge variant="destructive" className="text-xs">
          {joinCount}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingRequests.map((request) => (
            <div
              key={request.id}
              className="flex items-start gap-3 p-4 bg-info/10 border border-info/20 rounded-lg"
            >
              <UserPlus className="h-5 w-5 text-info mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">
                    {request.student?.name || t('groups.unknownStudent')}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    ({request.student?.email})
                  </span>
                </div>
                {request.message && (
                  <p className="text-sm text-muted-foreground mb-2">{request.message}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatRelativeTime(request.requestedAt)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleApprove(request.id)}
                  disabled={approveRequest.isPending || rejectRequest.isPending || isGroupFull}
                  title={isGroupFull ? t('groups.groupFull') : undefined}
                  className="bg-success text-white hover:bg-success/90"
                >
                  {approveRequest.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      {t('common.approve')}
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(request.id)}
                  disabled={approveRequest.isPending || rejectRequest.isPending}
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  {rejectRequest.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="mr-1 h-4 w-4" />
                      {t('common.reject')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
