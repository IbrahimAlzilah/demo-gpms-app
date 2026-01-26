import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApproveRegistration, useRejectRegistration } from '../hooks/useRegistrationOperations'
import { RegistrationDetailsView } from '../components/RegistrationDetailsView'
import { ManualRegistrationDialog } from '../components/ManualRegistrationDialog'
import { GroupedRegistrationCard } from '../components/GroupedRegistrationCard'
import { Textarea, Label, Button } from '@/components/ui'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSpinner, ConfirmDialog, BlockContent } from '@/components/common'
import type { ProjectRegistration } from '@/types/project.types'
import { useRegistrationsList } from './RegistrationsList.hook'
import { useToast } from '@/components/common'
import { AlertCircle, UserPlus, Users } from 'lucide-react'
import { apiClient } from '@/lib/axios'

export function RegistrationsList() {
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()
  const queryClient = useQueryClient()
  const [showManualRegistration, setShowManualRegistration] = useState(false)

  const approveRegistration = useApproveRegistration()
  const rejectRegistration = useRejectRegistration()

  const manualRegisterMutation = useMutation({
    mutationFn: async ({ projectId, groupId, autoApprove }: {
      projectId: string
      groupId: string
      autoApprove: boolean
    }) => {
      const response = await apiClient.post('/projects-committee/registrations', {
        project_id: projectId,
        student_group_id: groupId,
        auto_approve: autoApprove,
      })
      return response.data
    },
    onSuccess: () => {
      toastSuccess('registration.manualRegistrationSuccess')
      queryClient.invalidateQueries({ queryKey: ['committee-registrations'] })
      queryClient.invalidateQueries({ queryKey: ['committee-registrations-table'] })
      queryClient.invalidateQueries({ queryKey: ['project-registrations'] })
    },
    onError: (err: any) => {
      toastError(err?.message || 'registration.manualRegistrationError')
    },
  })

  const {
    data,
    state,
    setState,
    setGroupedPagination,
  } = useRegistrationsList()

  const handleApprove = async () => {
    if (!state.selectedRegistration) return
    try {
      await approveRegistration.mutateAsync({
        registrationId: state.selectedRegistration.id,
        comments: state.comments || undefined,
      })
      toastSuccess('registration.approveSuccess')
      queryClient.invalidateQueries({ queryKey: ['committee-registrations-grouped'] })
      queryClient.invalidateQueries({ queryKey: ['committee-registrations-table'] })
      queryClient.invalidateQueries({ queryKey: ['committee-registrations'] })
      setState((prev) => ({
        ...prev,
        showDialog: false,
        selectedRegistration: null,
        action: null,
        comments: '',
      }))
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'registration.approveError')
    }
  }

  const handleReject = async () => {
    if (!state.selectedRegistration) return
    if (!state.comments.trim()) {
      toastError('registration.commentsRequired')
      return
    }
    try {
      await rejectRegistration.mutateAsync({
        registrationId: state.selectedRegistration.id,
        comments: state.comments,
      })
      toastSuccess('registration.rejectSuccess')
      queryClient.invalidateQueries({ queryKey: ['committee-registrations-grouped'] })
      queryClient.invalidateQueries({ queryKey: ['committee-registrations-table'] })
      queryClient.invalidateQueries({ queryKey: ['committee-registrations'] })
      setState((prev) => ({
        ...prev,
        showDialog: false,
        selectedRegistration: null,
        action: null,
        comments: '',
      }))
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'registration.rejectError')
    }
  }

  const handleActionClick = (registration: ProjectRegistration, actionType: 'approve' | 'reject') => {
    setState((prev) => ({
      ...prev,
      selectedRegistration: registration,
      action: actionType,
      comments: '',
      showDialog: true,
    }))
  }

  if (data.isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <BlockContent
        title={t('registration.management')}
        actions={
          <Button onClick={() => setShowManualRegistration(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            {t('registration.manualRegistration', { defaultValue: 'Manual Registration' })}
          </Button>
        }
      >
        {/* Always show grouped view */}
        <div className="space-y-4">
          {data.isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : data.error ? (
            <div className="text-center py-8">
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm font-medium text-destructive">
                  {t('registration.loadError')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.error instanceof Error ? data.error.message : String(data.error)}
                </p>
              </div>
            </div>
          ) : data.groupedRequests && Array.isArray(data.groupedRequests) && data.groupedRequests.length > 0 ? (
            <>
              {data.groupedRequests.map((request) => (
                <GroupedRegistrationCard
                  key={request.id}
                  request={request}
                  onViewRegistration={(registration) => {
                    setState((prev) => ({ ...prev, registrationToViewId: registration.id }))
                  }}
                  onApproveProject={async (requestId, projectId) => {
                    const registration = request.projectRegistrations?.find(r => r.projectId === projectId)
                    if (registration) {
                      handleActionClick(registration, 'approve')
                    }
                  }}
                  onRejectRequest={async (requestId) => {
                    const request = data.groupedRequests?.find(r => r.id === requestId)
                    if (request?.projectRegistrations?.[0]) {
                      handleActionClick(request.projectRegistrations[0], 'reject')
                    }
                  }}
                  isLoadingAction={(requestId) => {
                    const request = data.groupedRequests?.find(r => r.id === requestId)
                    return request?.projectRegistrations?.some(r =>
                      approveRegistration.isPending || rejectRegistration.isPending
                    ) || false
                  }}
                />
              ))}
              {data.groupedPagination && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    {(() => {
                      const from = ((data.groupedPagination.page - 1) * data.groupedPagination.pageSize) + 1
                      const to = Math.min(data.groupedPagination.page * data.groupedPagination.pageSize, data.groupedPagination.total)
                      return `Showing ${from}-${to} of ${data.groupedPagination.total}`
                    })()}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!data.groupedPagination || data.groupedPagination.page <= 1}
                      onClick={() => setGroupedPagination((prev) => ({
                        ...prev,
                        pageIndex: prev.pageIndex - 1
                      }))}
                    >
                      {t('common.previous')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!data.groupedPagination || data.groupedPagination.page >= data.groupedPagination.totalPages}
                      onClick={() => setGroupedPagination((prev) => ({
                        ...prev,
                        pageIndex: prev.pageIndex + 1
                      }))}
                    >
                      {t('common.next')}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Users className="h-12 w-12 text-muted-foreground/50" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t('registration.noRegistrations')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {state.statusFilter !== 'all'
                      ? t('registration.noRegistrationsForStatus', { status: state.statusFilter }) ||
                      `No ${state.statusFilter} registrations found`
                      : t('registration.noRegistrationsDescription') ||
                      'No registration requests have been submitted yet'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </BlockContent>

      <ConfirmDialog
        open={state.showDialog}
        onOpenChange={(open) => setState((prev) => ({ ...prev, showDialog: open }))}
        title={
          state.action === 'approve'
            ? t('registration.approveTitle')
            : t('registration.rejectTitle')
        }
        description={
          state.action === 'approve'
            ? t('registration.approveDescription')
            : t('registration.rejectDescription')
        }
        confirmLabel={state.action === 'approve' ? t('common.approve') : t('common.reject')}
        cancelLabel={t('common.cancel')}
        onConfirm={state.action === 'approve' ? handleApprove : handleReject}
        variant={state.action === 'approve' ? 'default' : 'destructive'}
      >
        {state.selectedRegistration && (
          <div className="space-y-4 mt-4">
            <div>
              <Label>{t('registration.student')}</Label>
              <p className="text-sm font-medium">{state.selectedRegistration.student?.name}</p>
            </div>
            <div>
              <Label>{t('registration.project')}</Label>
              <p className="text-sm font-medium">{state.selectedRegistration.project?.title}</p>
            </div>
            <div>
              <Label>
                {state.action === 'approve'
                  ? t('registration.approvalComments')
                  : t('registration.rejectionComments')}
              </Label>
              <Textarea
                value={state.comments}
                onChange={(e) => setState((prev) => ({ ...prev, comments: e.target.value }))}
                placeholder={
                  state.action === 'approve'
                    ? t('registration.approvalCommentsPlaceholder')
                    : t('registration.rejectionCommentsPlaceholder')
                }
                rows={4}
                required={state.action === 'reject'}
              />
            </div>
          </div>
        )}
      </ConfirmDialog>

      <RegistrationDetailsView
        registrationId={state.registrationToViewId}
        open={!!state.registrationToViewId}
        onClose={() => {
          setState((prev) => ({ ...prev, registrationToViewId: null }))
        }}
      />

      <ManualRegistrationDialog
        open={showManualRegistration}
        onOpenChange={setShowManualRegistration}
        onRegister={async (projectId, groupId, autoApprove) => {
          await manualRegisterMutation.mutateAsync({ projectId, groupId, autoApprove })
        }}
        loading={manualRegisterMutation.isPending}
      />
    </>
  )
}
