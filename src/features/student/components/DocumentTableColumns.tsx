import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { StatusBadge } from "@/components/common/StatusBadge"
import type { Document } from "@/types/request.types"
import { MessageSquare, Download, File } from "lucide-react"
import { formatRelativeTime, formatFileSize } from "@/lib/utils/format"
import i18n from "@/lib/i18n/i18n"

interface DocumentTableColumnsProps {
  onView: (document: Document) => void
  rtl?: boolean
}

export function createDocumentColumns({
  onView,
  rtl = false,
}: DocumentTableColumnsProps): ColumnDef<Document>[] {
  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      proposal: i18n.t('document.type.proposal') || 'المقترح',
      chapters: i18n.t('document.type.chapters') || 'الفصول',
      final_report: i18n.t('document.type.finalReport') || 'التقرير النهائي',
      code: i18n.t('document.type.code') || 'الأكواد',
      presentation: i18n.t('document.type.presentation') || 'العرض',
      other: i18n.t('document.type.other') || 'أخرى',
    }
    return labels[type] || type
  }

  return [
    {
      accessorKey: "fileName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={i18n.t('document.fileName') || 'اسم الملف'} rtl={rtl} />
      ),
      cell: ({ row }) => (
        <div className="font-medium flex items-center gap-2">
          <File className="h-4 w-4 text-muted-foreground" />
          <span className="max-w-[300px] truncate">{row.original.fileName}</span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={i18n.t('document.type') || 'نوع الوثيقة'} rtl={rtl} />
      ),
      cell: ({ row }) => (
        <div className="text-sm">{getDocumentTypeLabel(row.original.type)}</div>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "reviewStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={i18n.t('document.reviewStatus') || 'حالة المراجعة'} rtl={rtl} />
      ),
      cell: ({ row }) => <StatusBadge status={`reviewStatus_${row.original.reviewStatus}`} />,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "fileSize",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={i18n.t('document.size') || 'الحجم'} rtl={rtl} />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatFileSize(row.original.fileSize)}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={i18n.t('document.submittedAt') || 'تاريخ التقديم'} rtl={rtl} />
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
        const document = row.original
        const viewLabel = i18n.t('common.view') || 'عرض'
        const downloadLabel = i18n.t('document.download') || 'تحميل'

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(document)}
              className="h-8 w-8 p-0"
              title={viewLabel}
              aria-label={viewLabel}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="sr-only">{viewLabel}</span>
            </Button>
            {document.fileUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(document.fileUrl, '_blank')}
                className="h-8 w-8 p-0"
                title={downloadLabel}
                aria-label={downloadLabel}
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">{downloadLabel}</span>
              </Button>
            )}
          </div>
        )
      },
    },
  ]
}



