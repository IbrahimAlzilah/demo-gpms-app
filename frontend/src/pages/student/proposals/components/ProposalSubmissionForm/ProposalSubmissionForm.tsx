import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalDialog, LoadingSpinner } from '@/components/common'
import { Button, Input, Textarea, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { AlertCircle, PlusCircle, X, Loader2, Calendar } from 'lucide-react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { submissionService } from '../../api/submission.service'
import { useMyGroup } from '@/pages/student/groups/hooks/useGroups'
import { usePeriodCheck } from '@/hooks/usePeriodCheck'
import { useSupervisors } from '../../hooks/useSupervisors'
import { useToast } from '@/components/common'
import type { ProposalSubmission, Proposal } from '@/types/project.types'
import type { ProposalFormData } from '../../types/Proposals.types'

interface ProposalSubmissionFormProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

const proposalSchema = z.object({
  title: z.string().min(1, 'proposal.titleRequired'),
  description: z.string().min(1, 'proposal.descriptionRequired'),
  proposedSupervisorId: z.string().optional(),
  targetProjectId: z.string().optional(),
  teamMembers: z.array(z.object({
    name: z.string().min(1),
    role: z.string().min(1),
  })).optional(),
})

const submissionFormSchema = z.object({
  proposals: z.array(proposalSchema).min(1, 'proposal.atLeastOneProposal').max(5, 'proposal.maxFiveProposals'),
})

type SubmissionFormData = z.infer<typeof submissionFormSchema>

export function ProposalSubmissionForm({ open, onClose, onSuccess }: ProposalSubmissionFormProps) {
  const { t } = useTranslation()
  const { toastError, toastSuccess } = useToast()
  const queryClient = useQueryClient()
  const { data: studentGroup, isLoading: groupLoading } = useMyGroup()
  const { isPeriodActive, isLoading: periodLoading } = usePeriodCheck('proposal_submission')
  const { isPeriodActive: isRegistrationActive } = usePeriodCheck('project_registration')
  const { data: supervisors = [], isLoading: supervisorsLoading } = useSupervisors()

  const canSubmit = isPeriodActive || isRegistrationActive

  // Fetch existing submission
  const { data: existingSubmission, isLoading: submissionLoading } = useQuery({
    queryKey: ['proposal-submission'],
    queryFn: () => submissionService.getSubmission(),
    enabled: open,
  })

  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionFormSchema),
    defaultValues: {
      proposals: [{ title: '', description: '', teamMembers: [] }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'proposals',
  })

  // Load existing submission data
  useEffect(() => {
    if (existingSubmission && existingSubmission.proposals) {
      form.reset({
        proposals: existingSubmission.proposals.map((p: Proposal) => ({
          title: p.title,
          description: p.description,
          proposedSupervisorId: p.proposedSupervisorId || undefined,
          targetProjectId: p.targetProjectId || undefined,
          teamMembers: p.teamMembers || [],
        })),
      })
    } else if (open && !existingSubmission) {
      form.reset({
        proposals: [{ title: '', description: '', teamMembers: [] }],
      })
    }
  }, [existingSubmission, open, form])

  const submitMutation = useMutation({
    mutationFn: (data: ProposalFormData[]) => {
      if (existingSubmission) {
        return submissionService.updateSubmission(
          data.map((p, index) => ({
            ...p,
            id: existingSubmission.proposals?.[index]?.id,
          }))
        )
      }
      return submissionService.submitProposals(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposal-submission'] })
      queryClient.invalidateQueries({ queryKey: ['student-proposals-table'] })
      toastSuccess('proposal.submitSuccess')
      onSuccess?.()
      onClose()
    },
    onError: (error: any) => {
      toastError(error?.response?.data?.message || 'proposal.submitError')
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    if (!canSubmit) {
      toastError('proposal.periodClosed')
      return
    }

    // During Project Registration: group is required
    // During Proposal Submission: group is optional
    const groupRequired = isRegistrationActive && !isPeriodActive
    if (groupRequired && !studentGroup) {
      toastError('proposal.groupRequiredForRegistration')
      return
    }

    const proposalsData: ProposalFormData[] = data.proposals.map((p) => ({
      title: p.title.trim(),
      description: p.description.trim(),
      proposedSupervisorId: p.proposedSupervisorId && p.proposedSupervisorId !== 'none' ? p.proposedSupervisorId : undefined,
      studentGroupId: studentGroup ? String(studentGroup.id) : undefined,
      targetProjectId: p.targetProjectId && p.targetProjectId !== 'none' ? p.targetProjectId : undefined,
      teamMembers: p.teamMembers?.filter(m => m.name.trim() && m.role.trim()) || [],
    }))

    await submitMutation.mutateAsync(proposalsData)
  })

  if (periodLoading || groupLoading || submissionLoading) {
    return (
      <ModalDialog open={open} onOpenChange={onClose} title={t('proposal.submitNew')}>
        <LoadingSpinner />
      </ModalDialog>
    )
  }

  // During Project Registration: groups are required
  // During Proposal Submission: groups are optional (individual submission allowed)
  const groupRequired = isRegistrationActive && !isPeriodActive

  // If period is not active and no existing submission, show only the message
  if (!canSubmit && !existingSubmission) {
    return (
      <ModalDialog
        open={open}
        onOpenChange={onClose}
        title={t('proposal.submitNew')}
      >
        <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
          <Calendar className="h-5 w-5 text-warning mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-warning-foreground">
              {t('proposal.periodClosedMessage')}
            </p>
          </div>
        </div>
      </ModalDialog>
    )
  }

  const canAddMore = fields.length < 5
  const canRemove = fields.length > 1

  return (
    <ModalDialog
      open={open}
      onOpenChange={onClose}
      title={existingSubmission ? t('proposal.editSubmission') : t('proposal.submitNew')}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">

        {groupRequired && !studentGroup && (
          <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-warning-foreground">
                {t('proposal.groupRequiredForRegistration')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('proposal.groupRequiredForRegistrationDescription')}
              </p>
            </div>
          </div>
        )}

        {groupRequired && !studentGroup && (
          <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-warning-foreground">
                {t('proposal.groupRequiredForRegistration')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('proposal.groupRequiredForRegistrationDescription')}
              </p>
            </div>
          </div>
        )}

        {existingSubmission && (
          <div className="flex items-start gap-3 p-4 bg-info/10 border border-info/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-info mt-0.5" />
            <div>
              <p className="text-sm font-medium text-info-foreground">
                {t('proposal.editingSubmission')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('proposal.canAddProposalsWhileEditing')}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">
                  {t('proposal.proposal')} {index + 1}
                </h4>
                {canRemove && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor={`proposals.${index}.title`}>
                    {t('proposal.title')} *
                  </Label>
                  <Input
                    {...form.register(`proposals.${index}.title`)}
                    id={`proposals.${index}.title`}
                    placeholder={t('proposal.titlePlaceholder')}
                  />
                  {form.formState.errors.proposals?.[index]?.title && (
                    <p className="text-sm text-destructive mt-1">
                      {t(form.formState.errors.proposals[index]?.title?.message || '')}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`proposals.${index}.description`}>
                    {t('proposal.description')} *
                  </Label>
                  <Textarea
                    {...form.register(`proposals.${index}.description`)}
                    id={`proposals.${index}.description`}
                    placeholder={t('proposal.descriptionPlaceholder')}
                    rows={4}
                  />
                  {form.formState.errors.proposals?.[index]?.description && (
                    <p className="text-sm text-destructive mt-1">
                      {t(form.formState.errors.proposals[index]?.description?.message || '')}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`proposals.${index}.proposedSupervisorId`}>
                    {t('proposal.proposedSupervisor')}
                  </Label>
                  <Select
                    value={form.watch(`proposals.${index}.proposedSupervisorId`) || 'none'}
                    onValueChange={(value) =>
                      form.setValue(`proposals.${index}.proposedSupervisorId`, value === 'none' ? undefined : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('proposal.selectSupervisor')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('common.none')}</SelectItem>
                      {supervisors.map((supervisor) => (
                        <SelectItem key={supervisor.id} value={supervisor.id}>
                          {supervisor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {canAddMore && (
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ title: '', description: '', teamMembers: [] })}
            className="w-full"
            disabled={!canSubmit && !existingSubmission}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            {t('proposal.addAnotherProposal')}
          </Button>
        )}

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={submitMutation.isPending || !canSubmit}>
            {submitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('common.submitting')}
              </>
            ) : (
              t('proposal.submit')
            )}
          </Button>
        </div>
      </form>
    </ModalDialog>
  )
}
