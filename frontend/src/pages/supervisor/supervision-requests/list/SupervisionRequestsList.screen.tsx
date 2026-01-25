import { useMemo, useCallback } from 'react'
import { Card, CardContent, Label, Textarea } from '@/components/ui'
import { ConfirmDialog } from '@/components/common'
import { useToast } from '@/components/common'
import { CheckCircle2, AlertTriangle, User, Briefcase, MessageSquare } from 'lucide-react'
import { useSupervisionRequestsList } from './SupervisionRequestsList.hook'
import { useApproveSupervisionRequest, useRejectSupervisionRequest } from '../hooks/useSupervisionRequestOperations'
import { SupervisionRequestDetailsView } from '../components/SupervisionRequestDetailsView'
import { AssignmentRequestsTab } from '../components/AssignmentRequestsTab'
import type { Project } from '@/types/project.types'

export function SupervisionRequestsList() {
  // REMOVED: activeTab state - No longer needed since Student Requests tab is removed
  const { toastSuccess, toastError } = useToast()


  const approveRequest = useApproveSupervisionRequest()
  const rejectRequest = useRejectSupervisionRequest()
  const {
    data,
    state,
    setState,
    canAcceptMore,
    totalCount,
    pageCount,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
    t,
  } = useSupervisionRequestsList()

  const handleApprove = async () => {
    if (!state.selectedRequest) return

    // Validate request status
    if (state.selectedRequest.supervisorApprovalStatus !== 'pending') {
      toastError('supervision.requestNotPending')
      setState((prev) => ({
        ...prev,
        showConfirmDialog: false,
        selectedRequest: null,
        action: null,
        comments: '',
      }))
      return
    }

    if (data.currentProjectCount >= data.maxProjectsPerSupervisor) {
      toastError('supervision.maxProjectsReached')
      return
    }

    try {
      await approveRequest.mutateAsync(state.selectedRequest.id)
      toastSuccess('supervision.approveSuccess')
      setState((prev) => ({
        ...prev,
        comments: '',
        selectedRequest: null,
        action: null,
        showConfirmDialog: false,
      }))
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        t('supervision.approveError')
      toastError(errorMessage)
    }
  }

  const handleReject = async () => {
    if (!state.selectedRequest) return

    // Validate request status
    if (state.selectedRequest.supervisorApprovalStatus !== 'pending') {
      toastError('supervision.requestNotPending')
      setState((prev) => ({
        ...prev,
        showConfirmDialog: false,
        selectedRequest: null,
        action: null,
        comments: '',
      }))
      return
    }

    try {
      await rejectRequest.mutateAsync({
        requestId: state.selectedRequest.id,
        comments: state.comments || undefined
      })
      toastSuccess('supervision.rejectSuccess')
      setState((prev) => ({
        ...prev,
        comments: '',
        selectedRequest: null,
        action: null,
        showConfirmDialog: false,
      }))
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        t('supervision.rejectError')
      toastError(errorMessage)
    }
  }

  // REMOVED: Student request handlers and columns - Students can no longer initiate supervision requests
  // Only Project Committee assignment requests are handled now

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">{t('nav.supervisionRequests')}</h2>
        <p className="text-muted-foreground">
          {t('supervision.manageRequestsDescription', { defaultValue: 'Manage supervision assignment requests from the Project Committee.' })}
        </p>
      </div>

      {/* REMOVED: Student Requests tab - Students can no longer initiate supervision requests */}
      {/* Only Project Committee can assign supervisors */}
      <div className="space-y-4 mt-6">
        {/* Project Count Info */}
        <Card className={canAcceptMore ? 'border-info py-4' : 'border-warning py-4'}>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  {t('supervision.currentProjects')}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">
                    {data.currentProjectCount} / {data.maxProjectsPerSupervisor}
                  </p>
                  <span className="text-sm text-muted-foreground">{t('project.activeProjects', { defaultValue: 'Active Projects' })}</span>
                </div>
              </div>
              {canAcceptMore ? (
                <CheckCircle2 className="h-8 w-8 text-success" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-warning" />
              )}
            </div>
            {!canAcceptMore && (
              <p className="text-xs text-warning mt-2">
                {t('supervision.maxProjectsReached')}
              </p>
            )}
          </CardContent>
        </Card>

        {/* REMOVED: Student Requests DataTable - Students can no longer initiate supervision requests */}
        
        {/* Committee Assignment Requests */}
        <AssignmentRequestsTab />
      </div>

      {/* REMOVED: Student request confirmation dialogs and details view */}
      {/* Students can no longer initiate supervision requests */}
    </div>
  )
}
