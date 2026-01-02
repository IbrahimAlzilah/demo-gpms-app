import * as React from "react"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useDirection } from "@/hooks/use-direction"

export type ActionVariant = "default" | "destructive" | "success" | "warning" | "primary"

export interface TableAction<T = unknown> {
  /**
   * Unique identifier for the action
   */
  id: string
  /**
   * Label text for the action (supports i18n keys)
   */
  label: string
  /**
   * Icon component to display
   */
  icon: React.ComponentType<{ className?: string }>
  /**
   * Callback function when action is clicked
   */
  onClick: (row: T) => void
  /**
   * Whether the action is disabled
   */
  disabled?: boolean | ((row: T) => boolean)
  /**
   * Whether the action should be hidden
   */
  hidden?: boolean | ((row: T) => boolean)
  /**
   * Visual variant of the action
   */
  variant?: ActionVariant
  /**
   * Additional className for the action item
   */
  className?: string
  /**
   * Whether to show a separator before this action
   */
  separator?: boolean
}

export interface ActionsDropdownProps<T = unknown> {
  /**
   * Array of actions to display
   */
  actions: TableAction<T>[]
  /**
   * The row data for this dropdown instance
   */
  row: T
  /**
   * Custom trigger button (optional)
   */
  trigger?: React.ReactNode
  /**
   * Additional className for the dropdown trigger
   */
  triggerClassName?: string
  /**
   * Alignment of the dropdown menu
   */
  align?: "start" | "center" | "end"
  /**
   * Side of the trigger to show the dropdown
   */
  side?: "top" | "right" | "bottom" | "left"
}

const variantStyles: Record<ActionVariant, string> = {
  default: "",
  destructive: "text-destructive focus:text-destructive",
  success: "text-success focus:text-success",
  warning: "text-warning focus:text-warning",
  primary: "text-primary focus:text-primary",
}

/**
 * Reusable ActionsDropdown component for data tables
 * 
 * @example
 * ```tsx
 * <ActionsDropdown
 *   row={proposal}
 *   actions={[
 *     {
 *       id: "view",
 *       label: t("common.view"),
 *       icon: Eye,
 *       onClick: (row) => onView(row),
 *     },
 *     {
 *       id: "edit",
 *       label: t("proposal.edit"),
 *       icon: Edit,
 *       onClick: (row) => onEdit(row),
 *       hidden: (row) => row.status !== "pending_review",
 *     },
 *     {
 *       id: "delete",
 *       label: t("common.delete"),
 *       icon: Trash2,
 *       onClick: (row) => onDelete(row),
 *       variant: "destructive",
 *       separator: true,
 *     },
 *   ]}
 * />
 * ```
 */
export function ActionsDropdown<T = unknown>({
  actions,
  row,
  trigger,
  triggerClassName,
  align = "start",
  side = "bottom",
}: ActionsDropdownProps<T>) {
  const isRTL = useDirection()
  // Filter and evaluate actions based on permissions
  const visibleActions = React.useMemo(() => {
    return actions.filter((action) => {
      if (typeof action.hidden === "function") {
        return !action.hidden(row)
      }
      return action.hidden !== true
    })
  }, [actions, row])

  // If no visible actions, don't render the dropdown
  if (visibleActions.length === 0) {
    return null
  }

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="sm"
      className={cn("h-8 w-8 p-0", triggerClassName)}
      aria-label="Actions"
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">Actions</span>
    </Button>
  )

  return (
    <DropdownMenu dir={isRTL ? "rtl" : "ltr"}>
      <DropdownMenuTrigger asChild>
        {trigger || defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? "end" : "start"} side={side} className="w-30">
        {visibleActions.map((action, index) => {
          const Icon = action.icon
          const isDisabled =
            typeof action.disabled === "function"
              ? action.disabled(row)
              : action.disabled ?? false

          return (
            <React.Fragment key={action.id}>
              {action.separator && index > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => !isDisabled && action.onClick(row)}
                disabled={isDisabled}
                className={cn(
                  "cursor-pointer",
                  variantStyles[action.variant ?? "default"],
                  action.className
                )}
              >
                <Icon className="me-2 h-4 w-4" />
                <span>{action.label}</span>
              </DropdownMenuItem>
            </React.Fragment>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
