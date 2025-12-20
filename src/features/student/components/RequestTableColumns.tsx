import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { StatusBadge } from "@/components/common/StatusBadge"
import type { Request } from "@/types/request.types"
import { Eye, X, User, Users, Briefcase, FileCheck, CheckCircle2, XCircle, Clock } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils/format"
import i18n from "@/lib/i18n/i18n"

interface RequestTableColumnsProps {
  onView: (request: Request) => void
  onCancel?: (request: Request) => void
  rtl?: boolean
}

export function createRequestColumns({
  onView,
  onCancel,
  rtl = false,
}: RequestTableColumnsProps): ColumnDef<Request>[] {
  const getRequestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      change_supervisor: i18n.t('request.type.changeSupervisor') || 'تغيير المشرف',
      change_group: i18n.t('request.type.changeGroup') || 'تغيير المجموعة',
      change_project: i18n.t('request.type.changeProject') || 'تغيير المشروع',
      other: i18n.t('request.type.other') || 'طلب آخر',
    }
    return labels[type] || type
  }

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'change_supervisor':
        return <User className="h-4 w-4" />
      case 'change_group':
        return <Users className="h-4 w-4" />
      case 'change_project':
        return <Briefcase className="h-4 w-4" />
      default:
        return <FileCheck className="h-4 w-4" />
    }
  }

  return [
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={i18n.t('request.type') || 'نوع الطلب'} rtl={rtl} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {getRequestTypeIcon(row.original.type)}
          <span className="font-medium">{getRequestTypeLabel(row.original.type)}</span>
        </div>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "reason",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={i18n.t('request.reason') || 'السبب'} rtl={rtl} />
      ),
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate text-muted-foreground text-sm">
          {row.original.reason}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={i18n.t('common.status') || 'الحالة'} rtl={rtl} />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      id: "workflow",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={i18n.t('request.workflow') || 'مسار الطلب'} rtl={rtl} />
      ),
      cell: ({ row }) => {
        const request = row.original
        return (
          <div className="flex items-center gap-2 text-xs">
            {request.supervisorApproval ? (
              <div className={`flex items-center gap-1 px-2 py-1 rounded ${
                request.supervisorApproval.approved
                  ? 'bg-success/10 text-success'
                  : 'bg-destructive/10 text-destructive'
              }`}>
                {request.supervisorApproval.approved ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {i18n.t('request.supervisorDecision') || 'قرار المشرف'}
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted text-muted-foreground">
                <Clock className="h-3 w-3" />
                {i18n.t('request.awaitingSupervisor') || 'في انتظار المشرف'}
              </div>
            )}
            {request.committeeApproval ? (
              <div className={`flex items-center gap-1 px-2 py-1 rounded ${
                request.committeeApproval.approved
                  ? 'bg-success/10 text-success'
                  : 'bg-destructive/10 text-destructive'
              }`}>
                {request.committeeApproval.approved ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {i18n.t('request.committeeDecision') || 'قرار اللجنة'}
              </div>
            ) : request.supervisorApproval?.approved && (
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted text-muted-foreground">
                <Clock className="h-3 w-3" />
                {i18n.t('request.awaitingCommittee') || 'في انتظار اللجنة'}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={i18n.t('request.submittedAt') || 'تاريخ التقديم'} rtl={rtl} />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatRelativeTime(row.original.createdAt)}
        </div>
      ),
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={i18n.t('common.actions') || 'الإجراءات'} rtl={rtl} />
      ),
      cell: ({ row }) => {
        const request = row.original
        const viewLabel = i18n.t('common.view') || 'عرض'
        const cancelLabel = i18n.t('request.cancel') || 'إلغاء'

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(request)}
              className="h-8 w-8 p-0"
              title={viewLabel}
              aria-label={viewLabel}
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">{viewLabel}</span>
            </Button>
            {request.status === 'pending' && onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCancel(request)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                title={cancelLabel}
                aria-label={cancelLabel}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">{cancelLabel}</span>
              </Button>
            )}
          </div>
        )
      },
    },
  ]
}



