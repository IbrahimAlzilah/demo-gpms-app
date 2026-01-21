import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/components/common'
import { useUpdateProposal } from '../hooks/useProposalOperations'
import { useProposal } from '../hooks/useProposals'
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

export function useProposalsEdit(proposalId: string, onSuccess?: () => void) {
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()
  const { data: proposal, isLoading } = useProposal(proposalId)
  const updateProposal = useUpdateProposal()

  const form = useForm<ProposalEditSchema>({
    resolver: zodResolver(proposalEditSchema(t)),
    defaultValues: proposal
      ? {
        title: proposal.title,
        description: proposal.description,
        proposedSupervisorId: proposal.proposedSupervisorId || '',
        teamMembers: proposal.teamMembers || [],
      }
      : {
        title: '',
        description: '',
        proposedSupervisorId: '',
        teamMembers: [],
      },
  })

  const { reset } = form

  // Update form when proposal loads
  useEffect(() => {
    if (proposal && !form.formState.isDirty) {
      reset({
        title: proposal.title,
        description: proposal.description,
        proposedSupervisorId: proposal.proposedSupervisorId || '',
        teamMembers: proposal.teamMembers || [],
      })
    }
  }, [proposal, form.formState.isDirty, reset])

  const handleSubmit = async (data: ProposalEditSchema) => {
    if (!proposal) {
      toastError('proposal.loadError')
      return
    }

    try {
      await updateProposal.mutateAsync({
        id: proposalId,
        data: {
          title: data.title,
          description: data.description,
          proposedSupervisorId: data.proposedSupervisorId || undefined,
          teamMembers: data.teamMembers || [],
        },
      })
      toastSuccess('committee.proposal.updateSuccess')
      onSuccess?.()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'committee.proposal.updateError'
      toastError(errorMsg)
    }
  }

  return {
    form,
    proposal,
    isLoading,
    isSubmitting: updateProposal.isPending,
    handleSubmit: form.handleSubmit(handleSubmit),
  }
}
