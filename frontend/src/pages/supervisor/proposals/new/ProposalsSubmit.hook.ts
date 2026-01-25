import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/components/common'
import { useAuthStore } from '@/pages/auth/login'
import { proposalService } from '../api/proposal.service'
import { usePeriodCheck } from '@/hooks/usePeriodCheck'
import type { ProposalFormData } from '../types/Proposals.types'

interface ProposalItem extends ProposalFormData {
  id: string
  errors?: Record<string, string>
}

export function useProposalsSubmit(onSuccess?: () => void) {
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()
  const { user } = useAuthStore()
  const { isPeriodActive } = usePeriodCheck('proposal_submission')

  const [proposals, setProposals] = useState<ProposalItem[]>([
    { id: '1', title: '', description: '', proposedSupervisorId: user?.id }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addProposal = () => {
    setProposals([...proposals, { id: Date.now().toString(), title: '', description: '', proposedSupervisorId: user?.id }])
  }

  const removeProposal = (id: string) => {
    if (proposals.length > 1) {
      setProposals(proposals.filter(p => p.id !== id))
    }
  }

  const updateProposal = (id: string, data: Partial<ProposalFormData>) => {
    setProposals(proposals.map(p => p.id === id ? { ...p, ...data, errors: undefined } : p))
  }

  const validateProposals = (): boolean => {
    let isValid = true
    const updatedProposals = proposals.map(proposal => {
      const errors: Record<string, string> = {}
      
      if (!proposal.title?.trim()) {
        errors.title = t('proposal.validation.titleRequired')
        isValid = false
      }
      
      if (!proposal.description?.trim()) {
        errors.description = t('proposal.validation.descriptionRequired')
        isValid = false
      }

      return { ...proposal, errors: Object.keys(errors).length > 0 ? errors : undefined }
    })

    setProposals(updatedProposals)
    return isValid
  }

  const handleSubmit = async () => {
    if (!user) {
      toastError(t('proposal.authRequired'))
      return
    }

    if (!isPeriodActive) {
      toastError(t('proposal.periodClosed'))
      return
    }

    if (!validateProposals()) {
      toastError(t('proposal.validationErrors'))
      return
    }

    setIsSubmitting(true)
    try {
      const proposalsData = proposals.map(p => ({
        title: p.title.trim(),
        description: p.description.trim(),
        proposedSupervisorId: p.proposedSupervisorId || user.id,
      }))

      await proposalService.createBatch(proposalsData)
      
      toastSuccess(t('proposal.submitSuccess'))
      onSuccess?.()
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || t('proposal.submitError')
      toastError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    proposals,
    addProposal,
    removeProposal,
    updateProposal,
    handleSubmit,
    isSubmitting,
    isPeriodActive,
  }
}
