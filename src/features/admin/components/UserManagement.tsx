import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDeleteUser } from '../hooks/useUsers'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { UserForm } from './UserForm'
import type { User } from '../../../types/user.types'
import { DataTable } from '@/components/ui/data-table'
import { createUserColumns } from './UserTableColumns'
import { useDataTable } from '@/hooks/useDataTable'
import { userService } from '../api/user.service'
import { DataTableFacetedFilter } from '@/components/ui/data-table/data-table-faceted-filter'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { UserPlus, Users, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/common/NotificationToast'

const roleOptions = [
  { label: "طالب", value: "student" },
  { label: "مشرف", value: "supervisor" },
  { label: "لجنة المناقشة", value: "discussion_committee" },
  { label: "لجنة المشاريع", value: "projects_committee" },
  { label: "مدير", value: "admin" },
]

const statusOptions = [
  { label: "نشط", value: "active" },
  { label: "غير نشط", value: "inactive" },
  { label: "معلق", value: "suspended" },
]

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
    totalCount,
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
      showToast(t('user.deleteSuccess') || 'تم حذف المستخدم بنجاح', 'success')
      setUserToDelete(null)
      setShowDeleteDialog(false)
    } catch (err) {
      showToast(t('user.deleteError') || 'فشل حذف المستخدم', 'error')
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
      }),
    [rtl]
  )

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingUser(null)
    showToast(
      editingUser 
        ? (t('user.updateSuccess') || 'تم تحديث المستخدم بنجاح')
        : (t('user.createSuccess') || 'تم إنشاء المستخدم بنجاح'),
      'success'
    )
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingUser(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            {t('nav.users') || 'إدارة المستخدمين'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('user.managementDescription') || 'التحكم الكامل في حسابات المستخدمين وإدارة صلاحياتهم'}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingUser(null)
            setShowForm(true)
          }}
          className="w-full sm:w-auto"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          {t('user.addUser') || 'إضافة مستخدم جديد'}
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>{t('user.loadError') || 'حدث خطأ أثناء تحميل المستخدمين'}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingUser 
                ? (t('user.editUser') || 'تعديل المستخدم')
                : (t('user.createUser') || 'إضافة مستخدم جديد')
              }
            </DialogTitle>
          </DialogHeader>
          <UserForm
            user={editingUser}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t('user.userList') || 'قائمة المستخدمين'}</span>
            {totalCount !== undefined && (
              <span className="text-sm font-normal text-muted-foreground">
                {totalCount} {t('user.totalUsers') || 'مستخدم'}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
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
            searchPlaceholder={t('user.searchPlaceholder') || 'البحث بالاسم أو البريد الإلكتروني...'}
            rtl={rtl}
            enableFiltering={true}
            enableViews={true}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setUserToDelete(null)
        }}
        onConfirm={handleDelete}
        title={t('user.confirmDelete') || 'تأكيد الحذف'}
        description={
          userToDelete
            ? t('user.confirmDeleteDescription', { name: userToDelete.name }) ||
              `هل أنت متأكد من حذف المستخدم "${userToDelete.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
            : ''
        }
        confirmLabel={t('common.delete') || 'حذف'}
        cancelLabel={t('common.cancel') || 'إلغاء'}
        variant="destructive"
        isLoading={deleteUser.isPending}
      />
    </div>
  )
}

