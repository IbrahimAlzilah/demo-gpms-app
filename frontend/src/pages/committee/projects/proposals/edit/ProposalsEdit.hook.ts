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
      }
      : {
        title: '',
        description: '',
      },
  })

  const { reset } = form

  // Update form when proposal loads
  useEffect(() => {
    if (proposal && !form.formState.isDirty) {
      reset({
        title: proposal.title,
        description: proposal.description,
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
        },
      })
      toastSuccess('committee.proposal.updateSuccess')
      onSuccess?.()
    } catch (err: any) {
      // Handle validation errors from backend
      const errorMessage = err?.response?.data?.message || err?.message || 'committee.proposal.updateError'
      toastError(errorMessage)
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
