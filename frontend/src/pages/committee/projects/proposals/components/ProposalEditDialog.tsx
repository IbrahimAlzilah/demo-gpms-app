import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Textarea, Label } from '@/components/ui'
import { ModalDialog } from '@/components/common'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { Proposal } from '@/types/project.types'
import { z } from 'zod'

const proposalEditSchema = (t: (key: string) => string) =>
  z.object({
    title: z.string().min(1, t('proposal.validation.titleRequired')).max(255, t('proposal.validation.titleMaxLength255')),
    description: z.string().min(1, t('proposal.validation.descriptionRequired')),
    proposedSupervisorId: z.string().optional(),
    teamMembers: z.array(
      z.object({
        name: z.string().min(1, 'Member name is required'),
        role: z.string().min(1, 'Role is required'),
      })
    ).optional(),
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
        proposedSupervisorId: proposal.proposedSupervisorId || '',
        teamMembers: proposal.teamMembers || [],
      }
      : undefined,
  })

  // Start with defaultValues but reset when proposal changes to ensure form uses latest data
  // Using a key on the component or useEffect would handle updates. ModalDialog unmounting when closed handles reset on close.
  // But if proposal changes while open, we might need reset. 
  // However, usually we select a proposal then open.

  if (!proposal) return null

  const onSubmit = (data: ProposalEditSchema) => {
    onConfirm(proposal.id, {
      title: data.title,
      description: data.description,
      proposedSupervisorId: data.proposedSupervisorId || undefined,
      teamMembers: data.teamMembers || [],
    })
    reset()
  }



  return (
    <ModalDialog
      open={!!proposal}
      onOpenChange={(open) => !open && onClose()}
      title={t('committee.proposal.editProposal')}
      description={t('committee.proposal.editDescription')}
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
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
            <p className="text-xs text-destructive flex items-center gap-1">
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
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Render Footer Actions inside the form wouldn't work easily with ModalDialog structure if we want strictly separated actions. 
            However, ModalDialog doesn't enforce action slot, it just renders children.
            But the previous implementation had DialogFooter.
            We should put actions at the bottom of the form.
        */}
        <div className="flex justify-end space-x-2 gap-2 mt-6 border-t pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('common.saving')}
              </>
            ) : (
              t('common.save')
            )}
          </Button>
        </div>
      </form>
    </ModalDialog>
  )
}
