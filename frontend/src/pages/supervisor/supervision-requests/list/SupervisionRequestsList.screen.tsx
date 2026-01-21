import { useMemo, useCallback, useState } from 'react'
import { DataTable, Card, CardContent, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/common'
import { useToast } from '@/components/common'
import { CheckCircle2, AlertTriangle, User, Briefcase, MessageSquare, Users, FileSignature } from 'lucide-react'
import { createSupervisionRequestColumns } from '../components/table'
import { useSupervisionRequestsList } from './SupervisionRequestsList.hook'
import { useApproveSupervisionRequest, useRejectSupervisionRequest } from '../hooks/useSupervisionRequestOperations'
import { SupervisionRequestDetailsView } from '../components/SupervisionRequestDetailsView'
import { AssignmentRequestsTab } from '../components/AssignmentRequestsTab'
import type { Project } from '@/types/project.types'

export function SupervisionRequestsList() {
  const [activeTab, setActiveTab] = useState('student-requests')
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

  const handleApproveClick = useCallback((request: Project) => {
    if (request.supervisorApprovalStatus !== 'pending') {
      toastError('supervision.requestNotPending')
      return
    }

    if (data.currentProjectCount >= data.maxProjectsPerSupervisor) {
      toastError('supervision.maxProjectsReached')
      return
    }
    setState((prev) => ({
      ...prev,
      selectedRequest: request,
      action: 'approve',
      showConfirmDialog: true,
    }))
  }, [data.currentProjectCount, data.maxProjectsPerSupervisor, t, setState])

  const handleRejectClick = useCallback((request: Project) => {
    if (request.supervisorApprovalStatus !== 'pending') {
      toastError('supervision.requestNotPending')
      return
    }

    setState((prev) => ({
      ...prev,
      selectedRequest: request,
      action: 'reject',
      showConfirmDialog: true,
    }))
  }, [t, setState])

  const handleViewClick = useCallback((request: Project) => {
    setState((prev) => ({
      ...prev,
      viewingRequest: request,
    }))
  }, [setState])

  const columns = useMemo(
    () =>
      createSupervisionRequestColumns({
        onView: handleViewClick,
        onApprove: handleApproveClick,
        onReject: handleRejectClick,
        canAcceptMore,
        t,
      }),
    [handleViewClick, handleApproveClick, handleRejectClick, canAcceptMore, t]
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">{t('nav.supervisionRequests')}</h2>
        <p className="text-muted-foreground">
          {t('supervision.manageRequestsDescription', { defaultValue: 'Manage supervision requests from students and the project committee.' })}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="student-requests" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('supervisor.studentRequests', { defaultValue: 'Student Requests' })}
          </TabsTrigger>
          <TabsTrigger value="committee-requests" className="flex items-center gap-2">
            <FileSignature className="h-4 w-4" />
            {t('supervisor.committeeRequests', { defaultValue: 'Committee Requests' })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="student-requests" className="space-y-4 mt-6">
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

          <DataTable
            toolbarContent={
              <Select
                value={state.statusFilter}
                onValueChange={(value) => {
                  setState((prev) => ({ ...prev, statusFilter: value as typeof prev.statusFilter }))
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }))
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t('common.filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  <SelectItem value="pending">{t('common.pending')}</SelectItem>
                  <SelectItem value="approved">{t('common.approved')}</SelectItem>
                  <SelectItem value="rejected">{t('common.rejected')}</SelectItem>
                </SelectContent>
              </Select>
            }
            columns={columns}
            data={data.requests}
            isLoading={data.isLoading}
            error={data.error}
            pageCount={pageCount}
            totalCount={totalCount}
            pageIndex={pagination.pageIndex}
            pageSize={pagination.pageSize}
            onPaginationChange={(pageIndex, pageSize) => {
              setPagination({ pageIndex, pageSize })
            }}
            sorting={sorting}
            onSortingChange={setSorting}
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
            searchValue={globalFilter}
            onSearchChange={setGlobalFilter}
            enableFiltering={true}
            enableViews={true}
            emptyMessage={t('supervision.noRequests')}
          />
        </TabsContent>

        <TabsContent value="committee-requests" className="mt-6">
          <AssignmentRequestsTab />
        </TabsContent>
      </Tabs>

      {/* Confirm Dialog used for Student Requests */}
      <ConfirmDialog
        open={state.showConfirmDialog}
        onClose={() => {
          setState((prev) => ({
            ...prev,
            showConfirmDialog: false,
            selectedRequest: null,
            action: null,
            comments: '',
          }))
        }}
        onConfirm={() => {
          if (state.action === 'approve') {
            handleApprove()
          } else if (state.action === 'reject') {
            handleReject()
          }
        }}
        title={
          state.action === 'approve' ? t('supervision.confirmApprove') : t('supervision.confirmReject')
        }
        description={
          state.action === 'approve' ? t('supervision.confirmApproveDescription') : t('supervision.confirmRejectDescription')
        }
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        variant={state.action === 'reject' ? 'destructive' : 'default'}
      >
        {state.selectedRequest && (
          <div className="space-y-4">
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>
                  <span className="font-medium">{t('supervision.projectTitle')}:</span> {state.selectedRequest.title}
                </span>
              </div>
              {state.selectedRequest.specialization && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <span className="font-medium">{t('supervision.specialization')}:</span> {state.selectedRequest.specialization}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {t('supervision.description')}
              </p>
              <p className="text-sm whitespace-pre-wrap">{state.selectedRequest.description}</p>
            </div>
            {(state.action === 'approve' || state.action === 'reject') && (
              <div className="space-y-2">
                <Label htmlFor="comments">
                  {t('supervision.comments')} ({t('common.optional')})
                </Label>
                <Textarea
                  id="comments"
                  value={state.comments}
                  onChange={(e) => setState((prev) => ({ ...prev, comments: e.target.value }))}
                  placeholder={t('supervision.commentsPlaceholder')}
                  rows={3}
                  className="resize-none"
                />
              </div>
            )}
          </div>
        )}
      </ConfirmDialog>

      {/* Request Details View for Student Requests */}
      <SupervisionRequestDetailsView
        request={state.viewingRequest}
        open={!!state.viewingRequest}
        onClose={() => setState((prev) => ({ ...prev, viewingRequest: null }))}
      />
    </div>
  )
}
