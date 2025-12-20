import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { StatusBadge } from "@/components/common/StatusBadge"
import type { Request } from "@/types/request.types"
import { CheckCircle2, XCircle, User, Briefcase, MessageSquare, AlertTriangle, CheckCircle } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils/format"
import i18n from "@/lib/i18n/i18n"
import { requiresSupervisorApproval } from "../../common/utils/requestRouting"

interface RequestProcessingTableColumnsProps {
  onApprove: (request: Request) => void
  onReject: (request: Request) => void
  rtl?: boolean
}

export function createRequestProcessingColumns({
  onApprove,
  onReject,
  rtl = false,
}: RequestProcessingTableColumnsProps): ColumnDef<Request>[] {
  const getRequestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      change_supervisor: i18n.t('requests.change_supervisor') || 'تغيير المشرف',
      change_group: i18n.t('requests.change_group') || 'تغيير المجموعة',
      change_project: i18n.t('requests.change_project') || 'تغيير المشروع',
      other: i18n.t('requests.other') || 'أخرى',
    }
    return labels[type] || type
  }

  return [
    {
      accessorKey: "student",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={i18n.t('committee.requests.student') || 'الطالب'} rtl={rtl} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.student?.name || '-'}</span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={i18n.t('request.type') || 'نوع الطلب'} rtl={rtl} />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{getRequestTypeLabel(row.original.type)}</div>
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
      id: "supervisorDecision",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={i18n.t('committee.requests.supervisorDecision') || 'قرار المشرف'} rtl={rtl} />
      ),
      cell: ({ row }) => {
        const request = row.original
        const needsSupervisor = requiresSupervisorApproval(request.type)
        
        if (!needsSupervisor) {
          return <span className="text-xs text-muted-foreground">-</span>
        }
        
        if (request.supervisorApproval) {
          return (
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
              request.supervisorApproval.approved
                ? 'bg-success/10 text-success'
                : 'bg-destructive/10 text-destructive'
            }`}>
              {request.supervisorApproval.approved ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              {request.supervisorApproval.approved
                ? (i18n.t('common.approved') || 'موافق')
                : (i18n.t('common.rejected') || 'مرفوض')
              }
            </div>
          )
        }
        
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-warning/10 text-warning text-xs">
            <AlertTriangle className="h-3 w-3" />
            {i18n.t('committee.requests.needsSupervisorApproval') || 'يتطلب موافقة المشرف'}
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
        const needsSupervisor = requiresSupervisorApproval(request.type)
        const isFromSupervisor = request.status === 'supervisor_approved'
        const canProcess = request.status === 'pending' || isFromSupervisor
        const approveLabel = i18n.t('common.accept') || 'قبول'
        const rejectLabel = i18n.t('common.reject') || 'رفض'

        if (!canProcess) {
          return <span className="text-xs text-muted-foreground">-</span>
        }

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onApprove(request)}
              className="h-8 text-success hover:text-success/80"
              title={approveLabel}
              aria-label={approveLabel}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span className="sr-only">{approveLabel}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReject(request)}
              className="h-8 text-destructive hover:text-destructive"
              title={rejectLabel}
              aria-label={rejectLabel}
            >
              <XCircle className="h-4 w-4" />
              <span className="sr-only">{rejectLabel}</span>
            </Button>
          </div>
        )
      },
    },
  ]
}



