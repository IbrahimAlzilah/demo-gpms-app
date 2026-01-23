import { useState } from 'react'
import {
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Eye,
    Edit,
    ChevronRight,
    User,
    Calendar
} from 'lucide-react'
import { Button } from '@/components/ui'
import { StatusBadge } from '@/components/common/StatusBadge'
import { cn } from '@/lib/utils'
import { formatRelativeTime, formatDate } from '@/lib/utils/format'
import type { Proposal } from '@/types/project.types'

interface ProposalCardProps {
    proposal: Proposal
    t: (key: string) => string
    onView: () => void
    onEdit?: () => void
    readOnly?: boolean
    index?: number
}

export function ProposalCard({
    proposal,
    t,
    onView,
    onEdit,
    readOnly = false,
    index = 0
}: ProposalCardProps) {
    const [isHovered, setIsHovered] = useState(false)

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'approved':
                return {
                    icon: CheckCircle2,
                    color: 'text-emerald-600 dark:text-emerald-400',
                    bgColor: 'bg-emerald-500/10',
                    borderColor: 'border-emerald-200 dark:border-emerald-800',
                    gradient: 'from-emerald-500/5 to-transparent',
                }
            case 'rejected':
                return {
                    icon: XCircle,
                    color: 'text-rose-600 dark:text-rose-400',
                    bgColor: 'bg-rose-500/10',
                    borderColor: 'border-rose-200 dark:border-rose-800',
                    gradient: 'from-rose-500/5 to-transparent',
                }
            case 'requires_modification':
                return {
                    icon: AlertCircle,
                    color: 'text-amber-600 dark:text-amber-400',
                    bgColor: 'bg-amber-500/10',
                    borderColor: 'border-amber-200 dark:border-amber-800',
                    gradient: 'from-amber-500/5 to-transparent',
                }
            default:
                return {
                    icon: Clock,
                    color: 'text-blue-600 dark:text-blue-400',
                    bgColor: 'bg-blue-500/10',
                    borderColor: 'border-blue-200 dark:border-blue-800',
                    gradient: 'from-blue-500/5 to-transparent',
                }
        }
    }

    const statusConfig = getStatusConfig(proposal.status)
    const StatusIcon = statusConfig.icon
    const canEdit = !readOnly && onEdit && (proposal.status === 'pending_review' || proposal.status === 'requires_modification')

    return (
        <div
            className={cn(
                'group relative rounded-xl border bg-card overflow-hidden',
                'transition-all duration-300 ease-out',
                'hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30',
                statusConfig.borderColor
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                animationDelay: `${index * 50}ms`,
                animation: 'fadeInUp 0.4s ease-out forwards',
            }}
        >
            {/* Status gradient accent */}
            <div className={cn(
                'absolute inset-x-0 top-0 h-1 bg-gradient-to-r',
                statusConfig.gradient
            )} />

            <div className="p-5">
                {/* Header with status */}
                <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={cn('p-1.5 rounded-lg', statusConfig.bgColor)}>
                                <StatusIcon className={cn('h-4 w-4', statusConfig.color)} />
                            </div>
                            <StatusBadge status={proposal.status} />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {proposal.title}
                        </h3>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap bg-muted/50 px-2 py-1 rounded-full">
                        #{proposal.id}
                    </span>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {proposal.description}
                </p>

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
                    {proposal.submitter && (
                        <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            <span>{proposal.submitter.name || proposal.submitter.email}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatRelativeTime(proposal.createdAt)}</span>
                    </div>
                    {proposal.reviewedAt && (
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>{t('proposal.reviewedAt')}: {formatDate(proposal.reviewedAt)}</span>
                        </div>
                    )}
                </div>

                {/* Review notes preview (if any) */}
                {proposal.reviewNotes && (
                    <div className={cn(
                        'p-3 rounded-lg mb-4 text-xs',
                        statusConfig.bgColor
                    )}>
                        <p className="font-medium text-foreground/80 mb-1">{t('proposal.reviewNotes')}:</p>
                        <p className="text-muted-foreground line-clamp-2">{proposal.reviewNotes}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onView}
                        className="flex-1 gap-2 group/btn"
                    >
                        <Eye className="h-4 w-4" />
                        {t('common.view')}
                        <ChevronRight className="h-3 w-3 ms-auto opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    </Button>
                    {canEdit && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onEdit}
                            className="gap-2"
                        >
                            <Edit className="h-4 w-4" />
                            {t('common.edit')}
                        </Button>
                    )}
                </div>
            </div>

            {/* Hover indicator */}
            <div className={cn(
                'absolute inset-y-0 start-0 w-1 bg-primary transition-transform duration-300',
                isHovered ? 'scale-y-100' : 'scale-y-0'
            )} />
        </div>
    )
}

// Animation keyframes (add to global CSS or use inline styles)
const styles = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`

// Inject styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style')
    styleSheet.textContent = styles
    document.head.appendChild(styleSheet)
}
