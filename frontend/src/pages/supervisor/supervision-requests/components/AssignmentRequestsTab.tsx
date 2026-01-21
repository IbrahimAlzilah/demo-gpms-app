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
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import { supervisionService } from '../api/supervision.service'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/common'
import { Textarea, Label } from '@/components/ui'
import type { SupervisorAssignmentRequest } from '../types/SupervisionRequests.types'

export function AssignmentRequestsTab() {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const [selectedRequest, setSelectedRequest] = useState<SupervisorAssignmentRequest | null>(null)
    const [action, setAction] = useState<'approve' | 'reject' | null>(null)
    const [response, setResponse] = useState('')

    const { data: requests, isLoading } = useQuery({
        queryKey: ['supervisor-assignment-requests-tab'],
        queryFn: () => supervisionService.getAssignmentRequests(),
    })

    // Approve mutation
    const approveMutation = useMutation({
        mutationFn: ({ id, response }: { id: number; response?: string }) =>
            supervisionService.approveAssignmentRequest(id, response),
        onSuccess: () => {
            toast.success(t('supervisor.requestApproved', { defaultValue: 'Assignment request approved' }))
            queryClient.invalidateQueries({ queryKey: ['supervisor-assignment-requests-tab'] })
            handleClose()
        },
        onError: (err: any) => {
            toast.error(err?.message || t('common.error'))
        }
    })

    // Reject mutation
    const rejectMutation = useMutation({
        mutationFn: ({ id, response }: { id: number; response: string }) =>
            supervisionService.rejectAssignmentRequest(id, response),
        onSuccess: () => {
            toast.success(t('supervisor.requestRejected', { defaultValue: 'Assignment request rejected' }))
            queryClient.invalidateQueries({ queryKey: ['supervisor-assignment-requests-tab'] })
            handleClose()
        },
        onError: (err: any) => {
            toast.error(err?.message || t('common.error'))
        }
    })

    const handleAction = (request: SupervisorAssignmentRequest, actionType: 'approve' | 'reject') => {
        setSelectedRequest(request)
        setAction(actionType)
        setResponse('')
    }

    const handleClose = () => {
        setSelectedRequest(null)
        setAction(null)
        setResponse('')
    }

    const handleConfirm = () => {
        if (!selectedRequest) return

        if (action === 'approve') {
            approveMutation.mutate({ id: selectedRequest.id, response })
        } else {
            if (!response.trim()) {
                toast.error(t('supervisor.responseRequired', { defaultValue: 'Response is required for rejection' }))
                return
            }
            rejectMutation.mutate({ id: selectedRequest.id, response })
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-200"><Clock className="w-3 h-3 mr-1" />{t('status.pending', { defaultValue: 'Pending' })}</Badge>
            case 'approved':
                return <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" />{t('status.approved', { defaultValue: 'Approved' })}</Badge>
            case 'rejected':
                return <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200"><XCircle className="w-3 h-3 mr-1" />{t('status.rejected', { defaultValue: 'Rejected' })}</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-8"><LoadingSpinner /></CardContent>
            </Card>
        )
    }

    if (!requests || requests.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t('supervisor.committeeRequests', { defaultValue: 'Committee Assignment Requests' })}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                        {t('supervisor.noCommitteeRequests', { defaultValue: 'No pending requests from project committee' })}
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <div className="space-y-4">
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('project.title', { defaultValue: 'Project' })}</TableHead>
                                    <TableHead>{t('committee.sender', { defaultValue: 'Sender' })}</TableHead>
                                    <TableHead>{t('committee.notes', { defaultValue: 'Notes' })}</TableHead>
                                    <TableHead>{t('common.date', { defaultValue: 'Date' })}</TableHead>
                                    <TableHead>{t('common.status', { defaultValue: 'Status' })}</TableHead>
                                    <TableHead>{t('common.actions', { defaultValue: 'Actions' })}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell className="font-medium">
                                            {request.project.title}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{request.requested_by_user?.name || 'Committee Member'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {request.committee_notes ? (
                                                <div className="max-w-[200px] truncate" title={request.committee_notes}>
                                                    {request.committee_notes}
                                                </div>
                                            ) : <span className="text-muted-foreground">-</span>}
                                        </TableCell>
                                        <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                                        <TableCell>
                                            {request.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        className="h-8"
                                                        onClick={() => handleAction(request, 'approve')}
                                                    >
                                                        {t('common.approve', { defaultValue: 'Approve' })}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="h-8"
                                                        onClick={() => handleAction(request, 'reject')}
                                                    >
                                                        {t('common.reject', { defaultValue: 'Reject' })}
                                                    </Button>
                                                </div>
                                            )}
                                            {(request.status === 'approved' || request.status === 'rejected') && request.supervisor_response && (
                                                <div className="text-xs text-muted-foreground max-w-[150px] truncate" title={request.supervisor_response}>
                                                    {request.supervisor_response}
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={!!selectedRequest}
                onOpenChange={(open) => !open && handleClose()}
                title={action === 'approve' ? t('supervisor.approveRequest', { defaultValue: 'Approve Request' }) : t('supervisor.rejectRequest', { defaultValue: 'Reject Request' })}
                description={''}
                confirmLabel={t('common.confirm', { defaultValue: 'Confirm' })}
                cancelLabel={t('common.cancel', { defaultValue: 'Cancel' })}
                variant={action === 'reject' ? 'destructive' : 'default'}
                onConfirm={handleConfirm}
            >
                <div className="space-y-4 py-2">
                    <p className="text-sm">
                        {action === 'approve'
                            ? t('supervisor.approveRequestConfirm', { title: selectedRequest?.project.title, defaultValue: `Are you sure you want to approve being a supervisor for "${selectedRequest?.project.title}"?` })
                            : t('supervisor.rejectRequestConfirm', { title: selectedRequest?.project.title, defaultValue: `Are you sure you want to reject being a supervisor for "${selectedRequest?.project.title}"?` })
                        }
                    </p>

                    <div className="space-y-2">
                        <Label htmlFor="response">
                            {t('supervisor.response', { defaultValue: 'Response/Comments' })} {action === 'reject' && <span className="text-destructive">*</span>}
                        </Label>
                        <Textarea
                            id="response"
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder={t('supervisor.addResponse', { defaultValue: 'Add a response...' })}
                            required={action === 'reject'}
                        />
                    </div>
                </div>
            </ConfirmDialog>
        </>
    )
}
