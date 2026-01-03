import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button, Input, Textarea, Label } from '@/components/ui'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { Proposal } from '@/types/project.types'
import { z } from 'zod'

const proposalEditSchema = (t: (key: string) => string) =>
  z.object({
    title: z.string().min(1, t('proposal.titleRequired') || 'Title is required').max(255, t('proposal.titleMaxLength') || 'Title must be less than 255 characters'),
    description: z.string().min(1, t('proposal.descriptionRequired') || 'Description is required'),
    objectives: z.string().min(1, t('proposal.objectivesRequired') || 'Objectives are required'),
    methodology: z.string().optional(),
    expectedOutcomes: z.string().optional(),
  })

type ProposalEditSchema = z.infer<ReturnType<typeof proposalEditSchema>>

interface ProposalEditDialogProps {
  proposal: Proposal | null
  onClose: () => void
  onConfirm: (proposalId: string, data: Partial<Proposal>) => void
  isLoading?: boolean
}

export function ProposalEditDialog({
  proposal,
  onClose,
  onConfirm,
  isLoading = false,
}: ProposalEditDialogProps) {
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProposalEditSchema>({
    resolver: zodResolver(proposalEditSchema(t)),
    defaultValues: proposal
      ? {
          title: proposal.title,
          description: proposal.description,
          objectives: proposal.objectives,
          methodology: proposal.methodology || '',
          expectedOutcomes: proposal.expectedOutcomes || '',
        }
      : undefined,
  })

  if (!proposal) return null

  const onSubmit = (data: ProposalEditSchema) => {
    onConfirm(proposal.id, {
      title: data.title,
      description: data.description,
      objectives: data.objectives,
      methodology: data.methodology || undefined,
      expected_outcomes: data.expectedOutcomes || undefined,
    })
    reset()
  }

  return (
    <Dialog open={!!proposal} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('committee.proposal.editProposal') || 'تعديل المقترح'}</DialogTitle>
          <DialogDescription>
            {t('committee.proposal.editDescription') || 'قم بتعديل تفاصيل المقترح'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                {t('proposal.title')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                {...register('title')}
                placeholder={t('proposal.titlePlaceholder')}
                className={errors.title ? 'border-destructive' : ''}
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                {t('proposal.description')} <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder={t('proposal.descriptionPlaceholder')}
                rows={5}
                className={errors.description ? 'border-destructive' : ''}
                aria-invalid={!!errors.description}
              />
              {errors.description && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="objectives">
                {t('proposal.objectives')} <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="objectives"
                {...register('objectives')}
                placeholder={t('proposal.objectivesPlaceholder')}
                rows={4}
                className={errors.objectives ? 'border-destructive' : ''}
                aria-invalid={!!errors.objectives}
              />
              {errors.objectives && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.objectives.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="methodology">
                {t('proposal.methodology')} ({t('common.optional')})
              </Label>
              <Textarea
                id="methodology"
                {...register('methodology')}
                placeholder={t('proposal.methodologyPlaceholder')}
                rows={4}
                className={errors.methodology ? 'border-destructive' : ''}
                aria-invalid={!!errors.methodology}
              />
              {errors.methodology && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.methodology.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedOutcomes">
                {t('proposal.expectedOutcomes')} ({t('common.optional')})
              </Label>
              <Textarea
                id="expectedOutcomes"
                {...register('expectedOutcomes')}
                placeholder={t('proposal.expectedOutcomesPlaceholder')}
                rows={4}
                className={errors.expectedOutcomes ? 'border-destructive' : ''}
                aria-invalid={!!errors.expectedOutcomes}
              />
              {errors.expectedOutcomes && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.expectedOutcomes.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.saving') || 'جاري الحفظ...'}
                </>
              ) : (
                t('common.save') || 'حفظ'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
