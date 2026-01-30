import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { Lock, Eye, Edit3, ClipboardCheck, User } from 'lucide-react'
import type { SupervisorEvaluationProjectItem } from '../../api/evaluation.service'

export interface SupervisorEvaluationTableColumnsProps {
  onEvaluate: (item: SupervisorEvaluationProjectItem) => void
  t: (key: string) => string
}

export function createSupervisorEvaluationColumns({
  onEvaluate,
  t,
}: SupervisorEvaluationTableColumnsProps): ColumnDef<SupervisorEvaluationProjectItem>[] {
  return [
    {
      accessorKey: 'project.title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.title')} />
      ),
      cell: ({ row }) => (
        <div className="font-medium max-w-[280px]">
          <p className="truncate text-foreground">{row.original.project.title}</p>
          {row.original.project.supervisor && (
            <p className="text-xs text-muted-foreground truncate mt-0.5 flex items-center gap-1">
              <User className="h-3 w-3 shrink-0" />
              {row.original.project.supervisor.name}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'project.description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.description')} />
      ),
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate text-sm text-muted-foreground">
          {row.original.project.description || '—'}
        </div>
      ),
    },
    {
      accessorKey: 'studentsCount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.students')} />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.studentsCount}</span>
      ),
    },
    {
      accessorKey: 'evaluationProgress',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('evaluation.progress')} />
      ),
      cell: ({ row }) => {
        const item = row.original
        const progress = item.evaluationProgress
        return (
          <span className="text-sm text-muted-foreground">
            {item.evaluatedCount}/{item.studentsCount} {t('discussion.evaluated')} ({progress}%)
          </span>
        )
      },
    },
    {
      accessorKey: 'isLocked',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.status')} />
      ),
      cell: ({ row }) => {
        const item = row.original
        const isLocked = item.isLocked
        const isComplete = item.evaluationProgress === 100
        if (isLocked) {
          return (
            <Badge variant="secondary" className="gap-1">
              <Lock className="h-3 w-3" />
              {t('common.locked')}
            </Badge>
          )
        }
        if (isComplete) {
          return (
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              {t('common.completed')}
            </Badge>
          )
        }
        if (item.evaluationProgress > 0) {
          return (
            <Badge variant="secondary">
              {t('common.inProgress')}
            </Badge>
          )
        }
        return (
          <Badge variant="outline" className="text-muted-foreground">
            {t('common.pending')}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">{t('common.actions')}</div>,
      cell: ({ row }) => {
        const item = row.original
        const isLocked = item.isLocked
        const isComplete = item.evaluationProgress === 100
        const hasProgress = item.evaluationProgress > 0
        const isReadOnly = isLocked

        return (
          <div className="flex justify-end">
            <Button
              variant={isReadOnly ? 'ghost' : hasProgress ? 'outline' : 'default'}
              size="sm"
              onClick={() => onEvaluate(item)}
              className="gap-1.5"
            >
              {isReadOnly ? (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  {t('common.view')}
                </>
              ) : isComplete ? (
                <>
                  <Edit3 className="h-3.5 w-3.5" />
                  {t('common.edit')}
                </>
              ) : (
                <>
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  {t('common.evaluate')}
                </>
              )}
            </Button>
          </div>
        )
      },
    },
  ]
}
