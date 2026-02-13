import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { Lock, Eye, Edit3, ClipboardCheck, User } from 'lucide-react'
import type { SupervisorDefenseEvaluationItem } from '../../api/evaluation.service'

export type DefenseStage = 'fd1' | 'fd2'

export interface SupervisorEvaluationTableColumnsProps {
  onEvaluate: (item: SupervisorDefenseEvaluationItem, stage: DefenseStage) => void
  t: (key: string) => string
}

function StageCell({
  stage,
  stats,
  t,
  onEvaluate,
  item,
}: {
  stage: DefenseStage
  stats: SupervisorDefenseEvaluationItem['fd1']
  t: (key: string) => string
  onEvaluate: (item: SupervisorDefenseEvaluationItem, stage: DefenseStage) => void
  item: SupervisorDefenseEvaluationItem
}) {
  const total = stats.totalStudents
  const evaluated = stats.supervisorEvaluated
  const progress = total > 0 ? Math.round((evaluated / total) * 100) : 0
  const isLocked = stats.isLocked
  const isComplete = stats.isComplete

  const label = stage === 'fd1' ? t('evaluation.fd1') : t('evaluation.fd2')

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {isLocked && (
          <Badge variant="secondary" className="gap-1 shrink-0">
            <Lock className="h-3 w-3" />
            {t('common.locked')}
          </Badge>
        )}
      </div>
      <span className="text-sm text-muted-foreground">
        {evaluated}/{total} {t('discussion.evaluated')} ({progress}%)
      </span>
      <Button
        variant={isLocked ? 'ghost' : isComplete ? 'outline' : 'default'}
        size="sm"
        onClick={() => onEvaluate(item, stage)}
        className="w-fit gap-1.5 mt-0.5"
      >
        {isLocked ? (
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
}

export function createSupervisorEvaluationColumns({
  onEvaluate,
  t,
}: SupervisorEvaluationTableColumnsProps): ColumnDef<SupervisorDefenseEvaluationItem>[] {
  return [
    {
      accessorKey: 'project.title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.title')} />
      ),
      cell: ({ row }) => (
        <div className="font-medium max-w-[280px]">
          <p className="truncate text-foreground">{row.original.project.title}</p>
          <p className="text-xs text-muted-foreground truncate mt-0.5 flex items-center gap-1">
            <User className="h-3 w-3 shrink-0" />
            {row.original.project.studentsCount} {t('common.students')}
          </p>
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
      id: 'fd1',
      header: () => t('evaluation.fd1'),
      cell: ({ row }) => (
        <StageCell
          stage="fd1"
          stats={row.original.fd1}
          t={t}
          onEvaluate={onEvaluate}
          item={row.original}
        />
      ),
    },
    {
      id: 'fd2',
      header: () => t('evaluation.fd2'),
      cell: ({ row }) => (
        <StageCell
          stage="fd2"
          stats={row.original.fd2}
          t={t}
          onEvaluate={onEvaluate}
          item={row.original}
        />
      ),
    },
  ]
}
