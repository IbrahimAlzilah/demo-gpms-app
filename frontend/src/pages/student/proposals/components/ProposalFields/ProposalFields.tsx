import { useTranslation } from 'react-i18next'
import { Input, Textarea, Label } from '@/components/ui'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { AlertCircle, FileText, MessageSquare, Sparkles, User, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProposalFormData } from '../../types/Proposals.types'
// import { useSupervisors } from '../../hooks/useSupervisors'

interface ProposalFieldsProps {
  proposal: ProposalFormData & { id: string; errors?: Record<string, string> }
  onChange: (data: Partial<ProposalFormData>) => void
  errors?: Record<string, string>
  disabled?: boolean
}

export function ProposalFields({ proposal, onChange, errors = {}, disabled = false }: ProposalFieldsProps) {
  const { t } = useTranslation()
  // const { data: supervisors = [], isLoading: supervisorsLoading, error: supervisorsError } = useSupervisors()
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
            className="flex items-center gap-1 text-sm font-medium"
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
            className="flex items-center gap-1 text-sm font-medium"
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

      {/* Supervisor Selection */}
      {/* <div className="space-y-2">
        <Label
          htmlFor={`proposedSupervisorId-${proposal.id}`}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <div className="p-1 rounded bg-primary/10">
            <User className="h-3.5 w-3.5 text-primary" />
          </div>
          {t('proposal.proposedSupervisor')}
          <span className="text-xs text-muted-foreground font-normal ms-1">
            ({t('common.optional') || 'Optional'})
          </span>
        </Label>

        {supervisorsLoading ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t('common.loading')}</span>
          </div>
        ) : supervisorsError ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{t('proposal.supervisorsLoadError') || 'Failed to load supervisors'}</span>
          </div>
        ) : (
          <Select
            value={proposal.proposedSupervisorId ? String(proposal.proposedSupervisorId) : ''}
            onValueChange={(value) => onChange({ proposedSupervisorId: value || undefined })}
            disabled={disabled}
          >
            <SelectTrigger
              id={`proposedSupervisorId-${proposal.id}`}
              className={cn(
                'transition-all duration-200',
                'focus:ring-2 focus:ring-primary/20',
                fieldErrors.proposedSupervisorId
                  ? 'border-destructive'
                  : 'hover:border-primary/50'
              )}
            >
              <SelectValue placeholder={t('proposal.selectSupervisor')} />
            </SelectTrigger>
            <SelectContent>
              {supervisors.length === 0 ? (
                <div className="px-2 py-4 text-center">
                  <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    {t('proposal.noSupervisorsAvailable') || 'No supervisors available'}
                  </p>
                </div>
              ) : (
                supervisors.map((supervisor) => (
                  <SelectItem
                    key={supervisor.id}
                    value={String(supervisor.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {supervisor.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <span>{supervisor.name}</span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )}

        {fieldErrors.proposedSupervisorId ? (
          <p className="text-xs text-destructive flex items-center gap-1.5">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {fieldErrors.proposedSupervisorId}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Optionally suggest a supervisor for your project
          </p>
        )}
      </div> */}
    </div>
  )
}
