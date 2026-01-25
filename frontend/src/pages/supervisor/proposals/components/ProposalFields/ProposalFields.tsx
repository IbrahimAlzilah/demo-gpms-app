import { useTranslation } from 'react-i18next'
import { Input, Textarea, Label } from '@/components/ui'
import { AlertCircle, FileText, MessageSquare, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProposalFormData } from '../../types/Proposals.types'

interface ProposalFieldsProps {
  proposal: ProposalFormData & { id: string; errors?: Record<string, string> }
  onChange: (data: Partial<ProposalFormData>) => void
  errors?: Record<string, string>
  disabled?: boolean
}

export function ProposalFields({ proposal, onChange, errors = {}, disabled = false }: ProposalFieldsProps) {
  const { t } = useTranslation()

  const fieldErrors = proposal.errors || errors

  // Character counters
  const titleLength = proposal.title?.length || 0
  const descriptionLength = proposal.description?.length || 0
  const maxTitleLength = 255
  const minDescriptionLength = 50

  return (
    <div className="space-y-6">
      {/* Title Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor={`title-${proposal.id}`}
            className="flex items-center gap-2 text-sm font-medium"
          >
            <div className="p-1 rounded bg-primary/10">
              <FileText className="h-3.5 w-3.5 text-primary" />
            </div>
            {t('proposal.title')}
            <span className="text-destructive">*</span>
          </Label>
          <span className={cn(
            'text-xs transition-colors',
            titleLength > maxTitleLength * 0.9 ? 'text-destructive' : 'text-muted-foreground'
          )}>
            {titleLength}/{maxTitleLength}
          </span>
        </div>
        <div className="relative">
          <Input
            id={`title-${proposal.id}`}
            value={proposal.title || ''}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder={t('proposal.titlePlaceholder')}
            className={cn(
              'transition-all duration-200',
              'focus:ring-2 focus:ring-primary/20',
              fieldErrors.title
                ? 'border-destructive focus:ring-destructive/20'
                : 'hover:border-primary/50'
            )}
            disabled={disabled}
            maxLength={maxTitleLength}
            aria-invalid={!!fieldErrors.title}
          />
          {titleLength > 0 && !fieldErrors.title && (
            <Sparkles className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
          )}
        </div>
        {fieldErrors.title ? (
          <p className="text-xs text-destructive flex items-center gap-1.5 animate-in slide-in-from-top-1">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {fieldErrors.title}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {t('proposal.tipTitle1') !== 'proposal.tipTitle1'
              ? t('proposal.tipTitle1')
              : 'Choose a clear, descriptive title for your project proposal'
            }
          </p>
        )}
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor={`description-${proposal.id}`}
            className="flex items-center gap-2 text-sm font-medium"
          >
            <div className="p-1 rounded bg-primary/10">
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
            </div>
            {t('proposal.description')}
            <span className="text-destructive">*</span>
          </Label>
          <span className={cn(
            'text-xs transition-colors',
            descriptionLength < minDescriptionLength ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
          )}>
            {descriptionLength < minDescriptionLength
              ? `${minDescriptionLength - descriptionLength} more needed`
              : `${descriptionLength} characters`
            }
          </span>
        </div>
        <div className="relative">
          <Textarea
            id={`description-${proposal.id}`}
            value={proposal.description || ''}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder={t('proposal.descriptionPlaceholder')}
            rows={6}
            className={cn(
              'resize-none transition-all duration-200',
              'focus:ring-2 focus:ring-primary/20',
              fieldErrors.description
                ? 'border-destructive focus:ring-destructive/20'
                : 'hover:border-primary/50'
            )}
            disabled={disabled}
            aria-invalid={!!fieldErrors.description}
          />
          {/* Progress indicator for minimum length */}
          {descriptionLength < minDescriptionLength && (
            <div className="absolute bottom-2 start-2 end-2">
              <div className="h-0.5 bg-muted/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.min((descriptionLength / minDescriptionLength) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
        {fieldErrors.description ? (
          <p className="text-xs text-destructive flex items-center gap-1.5 animate-in slide-in-from-top-1">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {fieldErrors.description}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {t('proposal.tipDesc2') !== 'proposal.tipDesc2'
              ? t('proposal.tipDesc2')
              : 'Describe your project objectives, methodology, and expected outcomes in detail'
            }
          </p>
        )}
      </div>
    </div>
  )
}
