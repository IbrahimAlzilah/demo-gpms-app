import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { Button } from "@/components/ui/button"
import type { Project } from "@/types/project.types"
import { formatDate } from "@/lib/utils/format"
import { ROUTES } from "@/lib/constants/constants"
import { Eye, FileText, ClipboardCheck } from "lucide-react"
import { Link } from "react-router-dom"

export interface ProjectsTableColumnsProps {
  t: (key: string) => string
  onView?: (project: Project) => void
}

export function createProjectsColumns({
  t,
  onView,
}: ProjectsTableColumnsProps): ColumnDef<Project>[] {
  const cols: ColumnDef<Project>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.title')} />
      ),
      cell: ({ row }) => <div className="font-medium max-w-[300px] truncate">{row.original.title}</div>,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.description')} />
      ),
      cell: ({ row }) => (
        <div className="max-w-[400px] truncate text-muted-foreground">
          {row.original.description}
        </div>
      ),
    },
    {
      id: 'workflow',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('discussion.workflowStatus')} />
      ),
      cell: ({ row }) => {
        const p = row.original
        const docsTotal = p.documentsCount ?? 0
        const docsApproved = p.documentsApprovedCount ?? 0
        const gradesTotal = p.gradesCount ?? 0
        const studentsCount = p.students?.length ?? 0
        const evaluationLabel = studentsCount > 0
          ? `${gradesTotal}/${studentsCount} ${t('discussion.evaluated')}`
          : '—'
        return (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="flex items-center gap-1" title={t('discussion.documentsPhase')}>
              <FileText className="h-3.5 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{docsApproved}/{docsTotal}</span>
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="flex items-center gap-1" title={t('discussion.evaluationPhase')}>
              <ClipboardCheck className="h-3.5 w-3 text-muted-foreground" />
              <span>{evaluationLabel}</span>
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.date')} />
      ),
      cell: ({ row }) => <div className="text-sm">{formatDate(row.original.createdAt)}</div>,
    },
  ]
  if (onView) {
    cols.push({
      id: 'actions',
      header: t('common.actions'),
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" asChild>
          <Link to={ROUTES.DISCUSSION_COMMITTEE.PROJECT_DETAIL(row.original.id)} className="gap-1">
            <Eye className="h-4 w-4" />
            {t('common.view')}
          </Link>
        </Button>
      ),
    })
  }
  return cols
}
