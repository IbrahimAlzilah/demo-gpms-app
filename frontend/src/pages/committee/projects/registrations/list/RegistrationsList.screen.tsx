import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApproveRegistration, useRejectRegistration } from '../hooks/useRegistrationOperations'
import { RegistrationDetailsView } from '../components/RegistrationDetailsView'
import { ManualRegistrationDialog } from '../components/ManualRegistrationDialog'
// Kept for backward compatibility (legacy grouped view)
// import { GroupedRegistrationCard } from '../components/GroupedRegistrationCard'
import { UnifiedGroupCard } from '../components/UnifiedGroupCard'
import { Card, CardContent, Textarea, Label, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { LoadingSpinner, ConfirmDialog, BlockContent, useToast } from '@/components/common'
// import type { ProjectRegistration } from '@/types/project.types'
import { useRegistrationsList } from './RegistrationsList.hook'
import { useUnifiedGroups } from '../hooks/useUnifiedGroups'
import { committeeProjectService } from '../../announce-projects/api/project.service'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, UserPlus, Users, Search } from 'lucide-react'
import { apiClient } from '@/lib/axios'

export function RegistrationsList() {
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()
  const queryClient = useQueryClient()
  const [showManualRegistration, setShowManualRegistration] = useState(false)

  const approveRegistration = useApproveRegistration()
  const rejectRegistration = useRejectRegistration()

  // Fetch available projects to enable per-project filtering of requesting groups
  const { data: availableProjects } = useQuery({
    queryKey: ['committee-registration-projects-for-filter'],
    queryFn: async () => {
      const result = await committeeProjectService.getTableData(
        { page: 1, pageSize: 1000 },
        'available_for_registration'
      )
      return result.data || []
    },
    staleTime: 5 * 60 * 1000,
  })

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
      queryClient.invalidateQueries({ queryKey: ['committee-registrations-grouped'] })
      queryClient.invalidateQueries({ queryKey: ['committee-unified-groups'] })
      queryClient.invalidateQueries({ queryKey: ['project-registrations'] })
    },
    onError: (err: any) => {
      toastError(err?.message || 'registration.manualRegistrationError')
    },
  })

  // Use unified groups hook to get groups with proposals and registrations
  const {
    unifiedGroups,
    isLoading: unifiedGroupsLoading,
    error: unifiedGroupsError,
    totalCount,
    pageCount,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    projectId,
    setProjectId,
    pagination,
    setPagination,
  } = useUnifiedGroups()

  // Keep the old hook for backward compatibility if needed
  const {
    // legacyData,
    state,
    setState,
    // setGroupedPagination,
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
      queryClient.invalidateQueries({ queryKey: ['committee-unified-groups'] })
      queryClient.invalidateQueries({ queryKey: ['committee-proposals-submissions'] })
      queryClient.invalidateQueries({ queryKey: ['committee-proposals-supervisor-submissions'] })
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
      queryClient.invalidateQueries({ queryKey: ['committee-unified-groups'] })
      queryClient.invalidateQueries({ queryKey: ['committee-proposals-submissions'] })
      queryClient.invalidateQueries({ queryKey: ['committee-proposals-supervisor-submissions'] })
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

  // Legacy table actions are no longer used; unified view handles current flow.

  if (unifiedGroupsLoading) {
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
            <UserPlus className="size-4" />
            {t('registration.manualRegistration', { defaultValue: 'Manual Registration' })}
          </Button>
        }
      >
        {/* Filters */}
        <div className="mb-4 flex items-center justify-between gap-2 flex-wrap">
          {/* Search - Left side */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('registration.searchPlaceholder') || 'Search groups...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 ps-9"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Project Filter - show all groups requesting the same project */}
            {availableProjects && availableProjects.length > 0 && (
              <Select
                value={projectId || 'all'}
                onValueChange={(value) => setProjectId(value === 'all' ? undefined : value)}
              >
                <SelectTrigger id="project-filter" className="w-[220px]">
                  <SelectValue placeholder={t('registration.filterByProject') || 'Filter by Project'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('common.all')} {t('registration.projects')}
                  </SelectItem>
                  {availableProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
            >
              <SelectTrigger id="status-filter" className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t('registration.allRequests') || 'All Requests'}
                </SelectItem>
                <SelectItem value="pending">{t('registration.pending')}</SelectItem>
                <SelectItem value="approved">{t('registration.approved')}</SelectItem>
                <SelectItem value="rejected">{t('registration.rejected')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Unified Groups View */}
        <div className="space-y-4">
          {unifiedGroupsError ? (
            <div className="text-center py-8">
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm font-medium text-destructive">
                  {t('registration.loadError')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {unifiedGroupsError instanceof Error ? unifiedGroupsError.message : String(unifiedGroupsError)}
                </p>
              </div>
            </div>
          ) : unifiedGroups.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Users className="h-12 w-12 text-muted-foreground/50" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t('registration.noRegistrations')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {search
                      ? t('registration.noResultsForSearch') || 'Try adjusting your search criteria'
                      : t('registration.noRegistrationsDescription') ||
                      'No registration requests have been submitted yet'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {unifiedGroups.map((unifiedGroup) => (
                <UnifiedGroupCard
                  key={unifiedGroup.id}
                  unifiedGroup={unifiedGroup}
                  onViewProposal={(proposal) => {
                    // Navigate to proposal view if needed
                    console.log('View proposal:', proposal.id)
                  }}
                  onViewRegistration={(registration) => {
                    setState((prev) => ({ ...prev, registrationToViewId: registration.id }))
                  }}
                  onApproveProposal={undefined}
                  onRejectProposal={undefined}
                  onRequestModification={undefined}
                  onEditProposal={undefined}
                  onDeleteProposal={undefined}
                  onApproveProject={async (requestId, projectId) => {
                    try {
                      const request = unifiedGroup.registrationRequests.find(r => r.id === requestId)
                      const registration = request?.projectRegistrations?.find(r => r.project?.id === projectId)
                      if (registration) {
                        await approveRegistration.mutateAsync({
                          registrationId: registration.id,
                          comments: undefined,
                        })
                        toastSuccess('registration.approveSuccess')
                        queryClient.invalidateQueries({ queryKey: ['committee-unified-groups'] })
                      }
                    } catch (err) {
                      toastError(err instanceof Error ? err.message : 'registration.approveError')
                    }
                  }}
                  onRejectRequest={async (requestId) => {
                    try {
                      const request = unifiedGroup.registrationRequests.find(r => r.id === requestId)
                      if (request?.projectRegistrations?.[0]) {
                        await rejectRegistration.mutateAsync({
                          registrationId: request.projectRegistrations[0].id,
                          comments: t('registration.rejectTitle'),
                        })
                        toastSuccess('registration.rejectSuccess')
                        queryClient.invalidateQueries({ queryKey: ['committee-unified-groups'] })
                      }
                    } catch (err) {
                      toastError(err instanceof Error ? err.message : 'registration.rejectError')
                    }
                  }}
                  isLoadingAction={(_, type) => {
                    if (type === 'registration') {
                      return approveRegistration.isPending || rejectRegistration.isPending
                    }
                    return false
                  }}
                />
              ))}
              {pageCount > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    {(() => {
                      const from = (pagination.pageIndex * pagination.pageSize) + 1
                      const to = Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalCount)
                      return `Showing ${from}-${to} of ${totalCount}`
                    })()}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.pageIndex === 0}
                      onClick={() => setPagination((prev) => ({
                        ...prev,
                        pageIndex: prev.pageIndex - 1
                      }))}
                    >
                      {t('common.previous')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.pageIndex >= pageCount - 1}
                      onClick={() => setPagination((prev) => ({
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
