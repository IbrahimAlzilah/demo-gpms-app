import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDeleteUser } from '../hooks/useUsers'
import { UserForm } from './UserForm'
import type { User } from '../../../types/user.types'
import { createUserColumns } from './UserTableColumns'
import { useDataTable } from '@/hooks/useDataTable'
import { userService } from '../api/user.service'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { DataTable, Button } from '@/components/ui'
import { BlockContent, ModalDialog } from '@/components/common'
import { AlertCircle, PlusCircle } from 'lucide-react'
import { useToast } from '@/components/common/NotificationToast'

export function UserManagement() {
  const { t } = useTranslation()
  const deleteUser = useDeleteUser()
  const { showToast } = useToast()
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const {
    data: users,
    pageCount,
    isLoading,
    error,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
    rtl,
  } = useDataTable({
    queryKey: ['admin-users-table'],
    queryFn: (params) => userService.getTableData(params),
    initialPageSize: 10,
    enableServerSide: true,
  })

  const handleDelete = async () => {
    if (!userToDelete) return
    try {
      await deleteUser.mutateAsync(userToDelete.id)
      showToast(t('user.deleteSuccess'), 'success')
      setUserToDelete(null)
      setShowDeleteDialog(false)
    } catch {
      showToast(t('user.deleteError'), 'error')
    }
  }

  const columns = useMemo(
    () =>
      createUserColumns({
        onEdit: (user) => {
          setEditingUser(user)
          setShowForm(true)
        },
        onDelete: (user) => {
          setUserToDelete(user)
          setShowDeleteDialog(true)
        },
        rtl,
        t,
      }),
    [rtl, t]
  )

  const handleFormSuccess = () => {
    const wasEditing = !!editingUser
    setShowForm(false)
    setEditingUser(null)
    showToast(
      wasEditing
        ? (t('user.updateSuccess'))
        : (t('user.createSuccess')),
      'success'
    )
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingUser(null)
  }

  const actions = useMemo(() => (
    <Button onClick={() => {
      setEditingUser(null)
      setShowForm(true)
    }}><PlusCircle className="mr-2 h-4 w-4" />{t('common.add')}</Button>
  ), [t])

  return (
    <>
      <BlockContent title={t('user.userList')} actions={actions}>
        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          error={error}
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
          rtl={rtl}
          enableFiltering={true}
          enableViews={true}
        />
      </BlockContent>

      {error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('user.loadError')}</span>
          </div>
        </BlockContent>
      )}

      <ModalDialog open={showForm} onOpenChange={setShowForm} title={editingUser ? t('user.editUser') : t('user.createUser')}>
        <UserForm
          user={editingUser}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </ModalDialog>

      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setUserToDelete(null)
        }}
        onConfirm={handleDelete}
        title={t('user.confirmDelete')}
        description={
          userToDelete
            ? t('user.confirmDeleteDescription', { name: userToDelete.name })
            : ''
        }
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="destructive"
      />
    </>
  )
}

