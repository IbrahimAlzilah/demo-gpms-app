import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useApproveRegistration, useRejectRegistration } from '../hooks/useRegistrationOperations'
import { createRegistrationColumns } from '../components/table'
import { RegistrationDetailsView } from '../components/RegistrationDetailsView'
import { DataTable, Textarea, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSpinner, ConfirmDialog, BlockContent } from '@/components/common'
import type { ProjectRegistration } from '@/types/project.types'
import { useRegistrationsList } from './RegistrationsList.hook'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'

export function RegistrationsList() {
  const { t } = useTranslation()

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
      toast.success(t('registration.approveSuccess'))
      setState((prev) => ({
        ...prev,
        showDialog: false,
        selectedRegistration: null,
        action: null,
        comments: '',
      }))
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('registration.approveError')
      )
    }
  }

  const handleReject = async () => {
    if (!state.selectedRegistration) return
    if (!state.comments.trim()) {
      toast.error(t('registration.commentsRequired'))
      return
    }
    try {
      await rejectRegistration.mutateAsync({
        registrationId: state.selectedRegistration.id,
        comments: state.comments,
      })
      toast.success(t('registration.rejectSuccess'))
      setState((prev) => ({
        ...prev,
        showDialog: false,
        selectedRegistration: null,
        action: null,
        comments: '',
      }))
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('registration.rejectError')
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
    <>
      <BlockContent title={t('registration.management')}>
        <DataTable
          toolbarContent={
            <Select
              value={state.statusFilter}
              onValueChange={(value) => setState((prev) => ({ ...prev, statusFilter: value as typeof prev.statusFilter }))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('common.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="pending">{t('registration.pending')}</SelectItem>
                <SelectItem value="approved">{t('registration.approved')}</SelectItem>
                <SelectItem value="rejected">{t('registration.rejected')}</SelectItem>
              </SelectContent>
            </Select>
          }
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
      </BlockContent>


      {data.error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('registration.loadError')}</span>
          </div>
        </BlockContent>
      )}

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
    </>
  )
}
