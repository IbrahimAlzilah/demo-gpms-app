import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface StatusBadgeProps {
  status: string
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  children?: ReactNode
  className?: string
}

const statusVariants: Record<string, { labelKey: string; variant: StatusBadgeProps['variant'] }> = {
  // Project statuses
  draft: { labelKey: 'status.draft', variant: 'default' },
  pending_review: { labelKey: 'status.pending_review', variant: 'warning' },
  approved: { labelKey: 'status.approved', variant: 'success' },
  rejected: { labelKey: 'status.rejected', variant: 'error' },
  in_progress: { labelKey: 'status.in_progress', variant: 'info' },
  completed: { labelKey: 'status.completed', variant: 'success' },
  available_for_registration: { labelKey: 'status.available_for_registration', variant: 'success' },
  
  // Request statuses
  pending: { labelKey: 'status.pending', variant: 'warning' },
  supervisor_approved: { labelKey: 'status.supervisor_approved', variant: 'info' },
  supervisor_rejected: { labelKey: 'status.supervisor_rejected', variant: 'error' },
  committee_approved: { labelKey: 'status.committee_approved', variant: 'success' },
  committee_rejected: { labelKey: 'status.committee_rejected', variant: 'error' },
  cancelled: { labelKey: 'status.cancelled', variant: 'default' },
  
  // Proposal statuses
  requires_modification: { labelKey: 'status.requires_modification', variant: 'warning' },
  
  // Document statuses
  reviewStatus_pending: { labelKey: 'status.reviewStatus_pending', variant: 'warning' },
  reviewStatus_approved: { labelKey: 'status.reviewStatus_approved', variant: 'success' },
  reviewStatus_rejected: { labelKey: 'status.reviewStatus_rejected', variant: 'error' },
  
  // User statuses
  active: { labelKey: 'status.active', variant: 'success' },
  inactive: { labelKey: 'status.inactive', variant: 'default' },
  suspended: { labelKey: 'status.suspended', variant: 'error' },
}

const variantStyles = {
  default: 'bg-muted text-muted-foreground',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-destructive/10 text-destructive',
  info: 'bg-info/10 text-info',
}

export function StatusBadge({ status, variant, children, className }: StatusBadgeProps) {
  const { t } = useTranslation()
  const statusInfo = statusVariants[status] || { labelKey: `status.${status}`, variant: variant || 'default' }
  const badgeVariant = variant || statusInfo.variant || 'default'
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[badgeVariant],
        className
      )}
    >
      {children || t(statusInfo.labelKey, { defaultValue: status })}
    </span>
  )
}

