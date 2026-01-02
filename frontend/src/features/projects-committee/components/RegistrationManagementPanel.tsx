import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useApproveRegistration,
  useRejectRegistration,
} from '../hooks/useRegistrationManagement'
import type { ProjectRegistration } from '../../../types/project.types'
import { useDataTable } from '@/hooks/useDataTable'
import { registrationService } from '../api/registration.service'
import { DataTable } from '@/components/ui'
import { Button, Textarea, Label } from '@/components/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner, ConfirmDialog } from '@/components/common'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AlertCircle, CheckCircle2, XCircle, User, Briefcase } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import type { ColumnDef } from '@tanstack/react-table'

export function RegistrationManagementPanel() {
  const { t } = useTranslation()
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [selectedRegistration, setSelectedRegistration] = useState<ProjectRegistration | null>(null)
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)
  const [comments, setComments] = useState('')
  const [showDialog, setShowDialog] = useState(false)

  const approveRegistration = useApproveRegistration()
  const rejectRegistration = useRejectRegistration()

  const {
    data: registrationsData,
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
  } = useDataTable({
    queryKey: ['committee-registrations-table', statusFilter],
    queryFn: (params) => {
      const filters = { ...params?.filters }
      if (statusFilter !== 'all') {
        filters.status = statusFilter
      }
      return registrationService.getTableData({ ...params, filters })
    },
    initialPageSize: 10,
    enableServerSide: true,
  })

  const registrations = registrationsData || []

  const handleApprove = async () => {
    if (!selectedRegistration) return
    try {
      await approveRegistration.mutateAsync({
        registrationId: selectedRegistration.id,
        comments: comments || undefined,
      })
      setShowDialog(false)
      setSelectedRegistration(null)
      setAction(null)
      setComments('')
    } catch (err) {
      console.error('Failed to approve registration:', err)
    }
  }

  const handleReject = async () => {
    if (!selectedRegistration) return
    if (!comments.trim()) {
      alert(t('registration.commentsRequired') || 'الرجاء إدخال سبب الرفض')
      return
    }
    try {
      await rejectRegistration.mutateAsync({
        registrationId: selectedRegistration.id,
        comments: comments,
      })
      setShowDialog(false)
      setSelectedRegistration(null)
      setAction(null)
      setComments('')
    } catch (err) {
      console.error('Failed to reject registration:', err)
    }
  }

  const handleActionClick = (registration: ProjectRegistration, actionType: 'approve' | 'reject') => {
    setSelectedRegistration(registration)
    setAction(actionType)
    setComments('')
    setShowDialog(true)
  }

  const columns: ColumnDef<ProjectRegistration>[] = useMemo(
    () => [
      {
        accessorKey: 'student',
        header: t('registration.student') || 'الطالب',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {row.original.student?.name || row.original.studentId}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'project',
        header: t('registration.project') || 'المشروع',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{row.original.project?.title || row.original.projectId}</span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: t('common.status') || 'الحالة',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'submittedAt',
        header: t('registration.submittedAt') || 'تاريخ التقديم',
        cell: ({ row }) => formatDate(row.original.submittedAt),
      },
      {
        id: 'actions',
        header: t('common.actions') || 'الإجراءات',
        cell: ({ row }) => {
          const registration = row.original
          if (registration.status !== 'pending') return null

          return (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleActionClick(registration, 'approve')}
                className="text-success hover:text-success"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                {t('common.approve') || 'قبول'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleActionClick(registration, 'reject')}
                className="text-destructive hover:text-destructive"
              >
                <XCircle className="h-4 w-4 mr-1" />
                {t('common.reject') || 'رفض'}
              </Button>
            </div>
          )
        },
      },
    ],
    [t]
  )

  if (isLoading) {
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
          <CardTitle>{t('registration.management') || 'إدارة طلبات التسجيل'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              variant={statusFilter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('pending')}
            >
              {t('registration.pending') || 'قيد الانتظار'}
            </Button>
            <Button
              variant={statusFilter === 'approved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('approved')}
            >
              {t('registration.approved') || 'معتمد'}
            </Button>
            <Button
              variant={statusFilter === 'rejected' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('rejected')}
            >
              {t('registration.rejected') || 'مرفوض'}
            </Button>
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              {t('common.all') || 'الكل'}
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={registrations}
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
            enableFiltering={true}
            enableViews={true}
            emptyMessage={t('registration.noRegistrations') || 'لا توجد طلبات تسجيل'}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        title={
          action === 'approve'
            ? t('registration.approveTitle') || 'قبول طلب التسجيل'
            : t('registration.rejectTitle') || 'رفض طلب التسجيل'
        }
        description={
          action === 'approve'
            ? t('registration.approveDescription') || 'هل أنت متأكد من قبول طلب التسجيل هذا؟'
            : t('registration.rejectDescription') || 'هل أنت متأكد من رفض طلب التسجيل هذا؟'
        }
        confirmText={action === 'approve' ? t('common.approve') || 'قبول' : t('common.reject') || 'رفض'}
        cancelText={t('common.cancel') || 'إلغاء'}
        onConfirm={action === 'approve' ? handleApprove : handleReject}
        variant={action === 'approve' ? 'default' : 'destructive'}
      >
        {selectedRegistration && (
          <div className="space-y-4 mt-4">
            <div>
              <Label>{t('registration.student') || 'الطالب'}</Label>
              <p className="text-sm font-medium">{selectedRegistration.student?.name}</p>
            </div>
            <div>
              <Label>{t('registration.project') || 'المشروع'}</Label>
              <p className="text-sm font-medium">{selectedRegistration.project?.title}</p>
            </div>
            <div>
              <Label>
                {action === 'approve'
                  ? t('registration.approvalComments') || 'ملاحظات (اختياري)'
                  : t('registration.rejectionComments') || 'سبب الرفض (مطلوب)'}
              </Label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={
                  action === 'approve'
                    ? t('registration.approvalCommentsPlaceholder') || 'ملاحظات إضافية...'
                    : t('registration.rejectionCommentsPlaceholder') || 'يرجى توضيح سبب الرفض...'
                }
                rows={4}
                required={action === 'reject'}
              />
            </div>
          </div>
        )}
      </ConfirmDialog>
    </div>
  )
}
