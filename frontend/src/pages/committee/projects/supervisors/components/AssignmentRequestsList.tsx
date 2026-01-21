import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common'
import { X, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { supervisorAssignmentService } from '../api/supervisor.service'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/common'

export function AssignmentRequestsList() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [cancelRequestId, setCancelRequestId] = useState<number | null>(null)

  const { data: requests, isLoading } = useQuery({
    queryKey: ['supervisor-assignment-requests'],
    queryFn: () => supervisorAssignmentService.getAssignmentRequests(),
  })

  const cancelMutation = useMutation({
    mutationFn: (requestId: number) => supervisorAssignmentService.cancelAssignmentRequest(requestId),
    onSuccess: () => {
      toast.success(t('supervisor.requestCancelled', { defaultValue: 'Assignment request cancelled' }))
      queryClient.invalidateQueries({ queryKey: ['supervisor-assignment-requests'] })
      setCancelRequestId(null)
    },
    onError: () => {
      toast.error(t('common.error', { defaultValue: 'An error occurred' }))
    },
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-700 bg-yellow-50 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            {t('status.pending', { defaultValue: 'Pending' })}
          </Badge>
        )
      case 'approved':
        return (
          <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {t('status.approved', { defaultValue: 'Approved' })}
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            {t('status.rejected', { defaultValue: 'Rejected' })}
          </Badge>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('supervisor.assignmentRequests', { defaultValue: 'Assignment Requests' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            {t('supervisor.noRequests', { defaultValue: 'No assignment requests found' })}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('supervisor.assignmentRequests', { defaultValue: 'Assignment Requests' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('project.title', { defaultValue: 'Project' })}</TableHead>
                <TableHead>{t('supervisor.name', { defaultValue: 'Supervisor' })}</TableHead>
                <TableHead>{t('common.status', { defaultValue: 'Status' })}</TableHead>
                <TableHead>{t('common.date', { defaultValue: 'Date' })}</TableHead>
                <TableHead>{t('common.actions', { defaultValue: 'Actions' })}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    <div>
                      <p className="font-medium">{request.project.title}</p>
                      {request.committee_notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {request.committee_notes}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{request.supervisor.name}</p>
                      <p className="text-xs text-muted-foreground">{request.supervisor.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                      {request.responded_at && (
                        <p className="text-xs text-muted-foreground">
                          {t('supervisor.respondedAt', { defaultValue: 'Responded' })}: {new Date(request.responded_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {request.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCancelRequestId(request.id)}
                        disabled={cancelMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-1" />
                        {t('common.cancel', { defaultValue: 'Cancel' })}
                      </Button>
                    )}
                    {request.status === 'rejected' && request.supervisor_response && (
                      <div className="text-xs text-muted-foreground">
                        <p className="font-medium">{t('supervisor.reason', { defaultValue: 'Reason' })}:</p>
                        <p>{request.supervisor_response}</p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={cancelRequestId !== null}
        onOpenChange={(open) => {
          if (!open) setCancelRequestId(null)
        }}
        onConfirm={() => cancelRequestId && cancelMutation.mutate(cancelRequestId)}
        title={t('supervisor.cancelRequest', { defaultValue: 'Cancel Request?' })}
        description={t('supervisor.cancelRequestConfirm', {
          defaultValue: 'Are you sure you want to cancel this assignment request?',
        })}
        confirmLabel={t('common.confirm', { defaultValue: 'Confirm' })}
        cancelLabel={t('common.cancel', { defaultValue: 'Cancel' })}
      />
    </>
  )
}
