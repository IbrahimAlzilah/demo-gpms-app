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
    <Dialog open={!!proposal} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('committee.proposal.editProposal')}</DialogTitle>
          <DialogDescription>
            {t('committee.proposal.editDescription')}
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

          </div>
          <DialogFooter className="mt-4">
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
