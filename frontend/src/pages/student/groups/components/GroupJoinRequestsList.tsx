import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { UserPlus, CheckCircle2, XCircle, Clock, Loader2, AlertCircle } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'
import { groupService } from '../api/group.service'
import { useApproveJoinRequest, useRejectJoinRequest } from '../hooks/useGroupOperations'
import type { ProjectGroup } from '@/types/project.types'

interface GroupJoinRequestsListProps {
  group: ProjectGroup
  onError?: (error: string) => void
  onSuccess?: (message: string) => void
}

export function GroupJoinRequestsList({
  group,
  onError,
  onSuccess,
}: GroupJoinRequestsListProps) {
  const { t } = useTranslation()
  const approveRequest = useApproveJoinRequest()
  const rejectRequest = useRejectJoinRequest()

  const { data: joinRequests, isLoading } = useQuery({
    queryKey: ['group-join-requests', group.id],
    queryFn: () => groupService.getJoinRequests(group.id),
  })

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

  if (pendingRequests.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          {t('groups.joinRequests')}
        </CardTitle>
        <CardDescription>
          {t('groups.joinRequestsDescription', { count: pendingRequests.length })}
        </CardDescription>
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
                  disabled={approveRequest.isPending || rejectRequest.isPending}
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
