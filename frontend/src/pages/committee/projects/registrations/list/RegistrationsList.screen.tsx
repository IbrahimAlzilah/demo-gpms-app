import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useApproveRegistration, useRejectRegistration } from '../hooks/useRegistrationOperations'
import { createRegistrationColumns } from '../components/table'
import { RegistrationDetailsView } from '../components/RegistrationDetailsView'
import { DataTable, Button, Textarea, Label } from '@/components/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner, ConfirmDialog } from '@/components/common'
import type { ProjectRegistration } from '@/types/project.types'
import { useRegistrationsList } from './RegistrationsList.hook'
import { useToast } from '@/components/common'

export function RegistrationsList() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const approveRegistration = useApproveRegistration()
  const rejectRegistration = useRejectRegistration()
  
  const {
    data,
    state,
    setState,
    pageCount,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
  } = useRegistrationsList()

  const handleApprove = async () => {
    if (!state.selectedRegistration) return
    try {
      await approveRegistration.mutateAsync({
        registrationId: state.selectedRegistration.id,
        comments: state.comments || undefined,
      })
      showToast(t('registration.approveSuccess'), 'success')
      setState((prev) => ({
        ...prev,
        showDialog: false,
        selectedRegistration: null,
        action: null,
        comments: '',
      }))
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t('registration.approveError'),
        'error'
      )
    }
  }

  const handleReject = async () => {
    if (!state.selectedRegistration) return
    if (!state.comments.trim()) {
      showToast(t('registration.commentsRequired'), 'error')
      return
    }
    try {
      await rejectRegistration.mutateAsync({
        registrationId: state.selectedRegistration.id,
        comments: state.comments,
      })
      showToast(t('registration.rejectSuccess'), 'success')
      setState((prev) => ({
        ...prev,
        showDialog: false,
        selectedRegistration: null,
        action: null,
        comments: '',
      }))
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t('registration.rejectError'),
        'error'
      )
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

  const columns = useMemo(
    () =>
      createRegistrationColumns({
        onView: (registration) => {
          setState((prev) => ({ ...prev, registrationToViewId: registration.id }))
        },
        onApprove: (registration) => handleActionClick(registration, 'approve'),
        onReject: (registration) => handleActionClick(registration, 'reject'),
        t,
      }),
    [setState, t]
  )

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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('registration.management')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              variant={state.statusFilter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setState((prev) => ({ ...prev, statusFilter: 'pending' }))}
            >
              {t('registration.pending')}
            </Button>
            <Button
              variant={state.statusFilter === 'approved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setState((prev) => ({ ...prev, statusFilter: 'approved' }))}
            >
              {t('registration.approved')}
            </Button>
            <Button
              variant={state.statusFilter === 'rejected' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setState((prev) => ({ ...prev, statusFilter: 'rejected' }))}
            >
              {t('registration.rejected')}
            </Button>
            <Button
              variant={state.statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setState((prev) => ({ ...prev, statusFilter: 'all' }))}
            >
              {t('common.all')}
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={data.registrations}
            isLoading={data.isLoading}
            error={data.error}
            pageCount={pageCount}
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
            emptyMessage={t('registration.noRegistrations')}
          />
        </CardContent>
      </Card>

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
        confirmText={state.action === 'approve' ? t('common.approve') : t('common.reject')}
        cancelText={t('common.cancel')}
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
    </div>
  )
}
