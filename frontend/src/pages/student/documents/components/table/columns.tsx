import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { StatusBadge } from '@/components/common/StatusBadge'
import type { Document } from '@/types/request.types'
import { MessageSquare, Download, File } from 'lucide-react'
import { formatRelativeTime, formatFileSize } from '@/lib/utils/format'
import type { DocumentTableColumnsProps } from '../../types/Documents.types'

export function createDocumentColumns({
  onView,
  t,
}: DocumentTableColumnsProps): ColumnDef<Document>[] {
  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      proposal: t('document.type.proposal'),
      chapters: t('document.type.chapters'),
      final_report: t('document.type.finalReport'),
      code: t('document.type.code'),
      presentation: t('document.type.presentation'),
      other: t('document.type.other'),
    }
    return labels[type] || type
  }

  return [
    {
      accessorKey: 'fileName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('document.fileName')} />
      ),
      cell: ({ row }) => (
        <div className="font-medium flex items-center gap-2">
          <File className="h-4 w-4 text-muted-foreground" />
          <span className="max-w-[300px] truncate">{row.original.fileName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('document.type')} />
      ),
      cell: ({ row }) => (
        <div className="text-sm">{getDocumentTypeLabel(row.original.type)}</div>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'reviewStatus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('document.reviewStatus')} />
      ),
      cell: ({ row }) => (
        <StatusBadge status={`reviewStatus_${row.original.reviewStatus}`} />
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'fileSize',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('document.size')} />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatFileSize(row.original.fileSize)}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('document.submittedAt')} />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatRelativeTime(row.original.createdAt)}
        </div>
      ),
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.actions')} />
      ),
      cell: ({ row }) => {
        const document = row.original
        const viewLabel = t('common.view')
        const downloadLabel = t('document.download')

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
