import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable, Button } from '@/components/ui'
import {
  BlockContent,
  ModalDialog,
  ConfirmDialog,
  useToast,
} from '@/components/common'
import { AlertCircle, PlusCircle } from 'lucide-react'
import { createUserColumns } from '../components/table'
import { UserForm } from '../components/UserForm'
import { useUsersList } from './UsersList.hook'
import { useDeleteUser } from '../hooks/useUserOperations'

export function UsersList() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const deleteUser = useDeleteUser()
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
  } = useUsersList()

  const columns = useMemo(
    () =>
      createUserColumns({
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
      showToast(t('user.deleteSuccess'), 'success')
      setState((prev) => ({
        ...prev,
        userToDelete: null,
        showDeleteDialog: false,
      }))
    } catch {
      showToast(t('user.deleteError'), 'error')
    }
  }

  const handleFormSuccess = () => {
    const wasEditing = !!state.selectedUser
    setState((prev) => ({
      ...prev,
      showForm: false,
      selectedUser: null,
    }))
    showToast(
      wasEditing ? t('user.updateSuccess') : t('user.createSuccess'),
      'success'
    )
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
        <PlusCircle className="mr-2 h-4 w-4" />
        {t('common.add')}
      </Button>
    ),
    [t, setState]
  )

  return (
    <>
      <BlockContent title={t('user.userList')} actions={actions}>
        <DataTable
          columns={columns}
          data={data.users}
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
