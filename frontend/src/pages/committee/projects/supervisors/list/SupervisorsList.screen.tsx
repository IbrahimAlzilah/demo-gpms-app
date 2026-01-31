import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { DataTable, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui'
import { BlockContent, ConfirmDialog } from '@/components/common'
import { useToast } from '@/components/common'
import { getApiErrorMessage } from '@/lib/utils'
import { useAssignSupervisor } from '../hooks/useSupervisorOperations'
import { useSupervisorsList } from './SupervisorsList.hook'
import { SupervisorAssignmentDialog } from '../components/SupervisorAssignmentDialog'
import { createSupervisorAssignmentColumns } from '../components/table'
import { supervisorAssignmentService } from '../api/supervisor.service'
import type { SupervisorAssignmentViewStatus } from './SupervisorsList.types'
import type { Project } from '@/types/project.types'

export function SupervisorsList() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { toastSuccess, toastError } = useToast()
  const assignSupervisor = useAssignSupervisor()
  const [cancelRequestId, setCancelRequestId] = useState<number | null>(null)
  const [unassignProject, setUnassignProject] = useState<Project | null>(null)

  const {
    data,
    state,
    setState,
    viewStatus,
    setViewStatus,
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
  } = useSupervisorsList()

  const handleAssign = async (
    projectId: string,
    supervisorId: string,
    requiresApproval: boolean,
    notes?: string
  ) => {
    try {
      if (requiresApproval) {
        await supervisorAssignmentService.requestAssignment(projectId, supervisorId, notes)
        queryClient.invalidateQueries({ queryKey: ['supervisor-assignment-table'] })
        queryClient.invalidateQueries({ queryKey: ['supervisor-assignment-requests'] })
        toastSuccess('supervisor.requestSent')
      } else {
        await assignSupervisor.mutateAsync({ projectId, supervisorId })
        toastSuccess('committee.supervisors.assignmentSuccess')
      }
      setState((prev) => ({ ...prev, selectedProject: null }))
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, t, 'committee.supervisors.assignmentError')
      toastError(message)
    }
  }

  const handleCancelRequestClick = (requestId: number) => {
    setCancelRequestId(requestId)
  }

  const handleCancelRequestConfirm = async () => {
    if (cancelRequestId == null) return
    try {
      await supervisorAssignmentService.cancelAssignmentRequest(cancelRequestId)
      toastSuccess('supervisor.requestCancelled')
      queryClient.invalidateQueries({ queryKey: ['supervisor-assignment-table'] })
      queryClient.invalidateQueries({ queryKey: ['supervisor-assignment-requests'] })
      setCancelRequestId(null)
    } catch {
      toastError('common.error')
    }
  }

  const handleUnassignConfirm = async () => {
    if (unassignProject?.id == null) return
    try {
      await supervisorAssignmentService.unassignSupervisor(String(unassignProject.id))
      toastSuccess('committee.supervisors.unassignSuccess')
      queryClient.invalidateQueries({ queryKey: ['supervisor-assignment-table'] })
      setUnassignProject(null)
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, t, 'common.error')
      toastError(message)
    }
  }

  const columns = useMemo(
    () =>
      createSupervisorAssignmentColumns({
        onAssign: (project: Project) => setState((prev) => ({ ...prev, selectedProject: project })),
        onChangeSupervisor: (project: Project) => setState((prev) => ({ ...prev, selectedProject: project })),
        onCancelRequest: handleCancelRequestClick,
        onUnassign: (project: Project) => setUnassignProject(project),
        t,
      }),
    [t, setState]
  )

  const statusOptions: { value: SupervisorAssignmentViewStatus; labelKey: string }[] = [
    { value: 'all', labelKey: 'common.all' },
    { value: 'needs_supervisor', labelKey: 'committee.supervisors.statusNeedsSupervisor' },
    { value: 'pending_approval', labelKey: 'committee.supervisors.statusPendingApproval' },
    { value: 'approved', labelKey: 'committee.supervisors.statusApproved' },
    { value: 'rejected', labelKey: 'committee.supervisors.statusRejected' },
  ]

  return (
    <>
      <BlockContent
        title={t('committee.supervisors.pageTitle')}
        variant="data-table"
      >
        <DataTable
          toolbarContent={
            <Select
              value={viewStatus}
              onValueChange={(value) => setViewStatus(value as SupervisorAssignmentViewStatus)}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder={t('common.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
          columns={columns}
          data={data.rows}
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
          emptyMessage={t('committee.supervisors.noProjectsEmpty')}
        />
      </BlockContent>

      <SupervisorAssignmentDialog
        open={!!state.selectedProject}
        onOpenChange={(open) => {
          if (!open) setState((prev) => ({ ...prev, selectedProject: null }))
        }}
        project={state.selectedProject}
        supervisors={data.supervisors}
        onAssign={handleAssign}
        loading={assignSupervisor.isPending}
      />

      <ConfirmDialog
        open={cancelRequestId !== null}
        onOpenChange={(open) => {
          if (!open) setCancelRequestId(null)
        }}
        onConfirm={handleCancelRequestConfirm}
        title={t('supervisor.cancelRequest')}
        description={t('supervisor.cancelRequestConfirm')}
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
      />

      <ConfirmDialog
        open={unassignProject !== null}
        onOpenChange={(open) => {
          if (!open) setUnassignProject(null)
        }}
        onConfirm={handleUnassignConfirm}
        title={t('committee.supervisors.confirmUnassign')}
        description={t('committee.supervisors.confirmUnassignDescription', {
          title: unassignProject?.title ?? '',
        })}
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
      />
    </>
  )
}
