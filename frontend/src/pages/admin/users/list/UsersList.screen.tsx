import { useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import {
  BlockContent,
  ModalDialog,
  ConfirmDialog,
} from '@/components/common'
import { useToast } from '@/components/common'
import { AlertCircle, PlusCircle } from 'lucide-react'
import { createUserColumns } from '../components/table'
import { UserForm } from '../components/UserForm'
import { UserViewDialog } from '../components/UserViewDialog'
import { useUsersList } from './UsersList.hook'
import { useDeleteUser } from '../hooks/useUserOperations'

export function UsersList() {
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()

  const deleteUser = useDeleteUser()
  const {
    data,
    state,
    setState,
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
  } = useUsersList()

  const roleFilterValue = columnFilters.find((f) => f.id === 'role')?.value ?? 'all'

  const handleRoleFilterChange = useCallback(
    (value: string) => {
      setColumnFilters((prev) => {
        const rest = prev.filter((f) => f.id !== 'role')
        if (value === 'all') return rest
        return [...rest, { id: 'role', value }]
      })
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    },
    [setColumnFilters, setPagination]
  )

  const columns = useMemo(
    () =>
      createUserColumns({
        onView: (user) => {
          setState((prev) => ({ ...prev, selectedUser: user, showView: true }))
        },
        onEdit: (user) => {
          setState((prev) => ({ ...prev, selectedUser: user, showForm: true }))
        },
        onDelete: (user) => {
          setState((prev) => ({
            ...prev,
            userToDelete: user,
            showDeleteDialog: true,
          }))
        },
        t,
      }),
    [t, setState]
  )

  const handleDelete = async () => {
    if (!state.userToDelete) return
    try {
      await deleteUser.mutateAsync(state.userToDelete.id)
      toastSuccess('user.deleteSuccess')
      setState((prev) => ({
        ...prev,
        userToDelete: null,
        showDeleteDialog: false,
      }))
    } catch {
      toastError('user.deleteError')
    }
  }

  const handleFormSuccess = () => {
    const wasEditing = !!state.selectedUser
    setState((prev) => ({
      ...prev,
      showForm: false,
      selectedUser: null,
    }))
    toastSuccess(wasEditing ? 'user.updateSuccess' : 'user.createSuccess')
  }

  const handleFormCancel = () => {
    setState((prev) => ({
      ...prev,
      showForm: false,
      selectedUser: null,
    }))
  }

  const actions = useMemo(
    () => (
      <Button
        onClick={() => {
          setState((prev) => ({ ...prev, selectedUser: null, showForm: true }))
        }}
      >
        <PlusCircle className="size-4" />
        {t('common.add')}
      </Button>
    ),
    [t, setState]
  )

  return (
    <>
      <BlockContent title={t('user.userList')} actions={actions} variant="data-table">
        <DataTable
          toolbarContent={
            <Select value={roleFilterValue} onValueChange={handleRoleFilterChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('user.filterByRole')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="student">{t('roles.student')}</SelectItem>
                <SelectItem value="supervisor">{t('roles.supervisor')}</SelectItem>
                <SelectItem value="discussion_committee">{t('roles.discussion_committee')}</SelectItem>
                <SelectItem value="projects_committee">{t('roles.projects_committee')}</SelectItem>
                <SelectItem value="admin">{t('roles.admin')}</SelectItem>
              </SelectContent>
            </Select>
          }
          columns={columns}
          data={data.users}
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
          searchPlaceholder={t('user.searchPlaceholder')}
          enableFiltering={true}
          enableViews={true}
        />
      </BlockContent>

      {data.error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('user.loadError')}</span>
          </div>
        </BlockContent>
      )}

      <ModalDialog
        open={state.showForm}
        onOpenChange={(open) =>
          setState((prev) => ({ ...prev, showForm: open }))
        }
        title={
          state.selectedUser ? t('user.editUser') : t('user.createUser')
        }
      >
        <UserForm
          user={state.selectedUser}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </ModalDialog>

      <UserViewDialog
        user={state.showView ? state.selectedUser : null}
        open={state.showView}
        onClose={() => setState((prev) => ({ ...prev, showView: false }))}
      />

      <ConfirmDialog
        open={state.showDeleteDialog}
        onClose={() => {
          setState((prev) => ({
            ...prev,
            showDeleteDialog: false,
            userToDelete: null,
          }))
        }}
        onConfirm={handleDelete}
        title={t('user.confirmDelete')}
        description={
          state.userToDelete
            ? t('user.confirmDeleteDescription', {
              name: state.userToDelete.name,
            })
            : ''
        }
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="destructive"
      />
    </>
  )
}
