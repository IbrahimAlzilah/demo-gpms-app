import type { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header"
import { StatusBadge } from "@/components/common/StatusBadge"
import { ActionsDropdown } from "@/components/common/ActionsDropdown"
import type { Project } from "@/types/project.types"
import { Eye, Users, TrendingUp, ClipboardCheck } from "lucide-react"
import { ROUTES } from "@/lib/constants/constants"
import type { ProjectTableColumnsProps } from '../../types/Projects.types'

export function createProjectColumns({
  t,
  onProjectSelect,
  navigate,
  onEvaluate,
}: ProjectTableColumnsProps): ColumnDef<Project>[] {
  return [
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
        <div className="max-w-[400px] truncate text-muted-foreground text-sm">
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: "currentGroups",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('project.groups')} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>
            {row.original.currentGroups ?? 0}/{row.original.maxGroups ?? 1}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.status')} />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('common.actions')} />
      ),
      cell: ({ row }) => {
        const project = row.original

        const handleNavigate = (path: string) => {
          if (navigate) {
            navigate(path)
          } else {
            window.location.href = path
          }
        }

        const actions = [
          {
            id: 'view',
            label: t('common.view'),
            icon: Eye,
            onClick: () => {
              if (onProjectSelect) {
                onProjectSelect(project)
              } else {
                handleNavigate(`${ROUTES.SUPERVISOR.PROJECTS}/${project.id}`)
              }
            },
            variant: 'default' as const,
          },
          {
            id: 'progress',
            label: t('nav.progress'),
            icon: TrendingUp,
            onClick: () => {
              if (onProjectSelect) {
                onProjectSelect(project)
              } else {
                handleNavigate(`${ROUTES.SUPERVISOR.PROJECTS}/${project.id}?tab=progress`)
              }
            },
            variant: 'primary' as const,
          },
          {
            id: 'evaluation',
            label: t('nav.evaluation'),
            icon: ClipboardCheck,
            onClick: () => {
              if (project.students && project.students.length > 0) {
                if (onEvaluate) {
                  onEvaluate(project)
                } else if (onProjectSelect) {
                  onProjectSelect(project)
                } else {
                  handleNavigate(`${ROUTES.SUPERVISOR.PROJECTS}/${project.id}?tab=evaluate`)
                }
              }
            },
            hidden: (row: Project) => !row.students || row.students.length === 0,
            variant: 'primary' as const,
            separator: true,
          },
        ]

        return <ActionsDropdown row={project} actions={actions} />
      },
    },
  ]
}
