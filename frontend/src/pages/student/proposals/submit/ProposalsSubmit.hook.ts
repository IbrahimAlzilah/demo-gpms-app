import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/components/common'
import { useMyGroup } from '@/pages/student/groups/hooks/useGroups'
import { useAuthStore } from '@/pages/auth/login'
import { useCreateBatchProposals } from '../hooks/useProposalOperations'
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
  const { data: studentGroup } = useMyGroup()
  const { isPeriodActive: isSubmissionPeriod, isLoading: isPeriodLoading } = usePeriodCheck('proposal_submission')
  // Only allow submission during proposal_submission period (not registration period)
  const isPeriodActive = isSubmissionPeriod
  const createBatchMutation = useCreateBatchProposals()

  const [proposals, setProposals] = useState<ProposalItem[]>([
    { id: '1', title: '', description: '' }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLocked, setIsLocked] = useState(false)

  // Check lock status from group data
  useEffect(() => {
    if (studentGroup && studentGroup.leaderId === user?.id) {
      // Check if group has proposals_initial_submitted_at set (lock indicator)
      const locked = !!(studentGroup.proposalsInitialSubmittedAt || studentGroup.proposals_initial_submitted_at)
      setIsLocked(locked)
    } else {
      setIsLocked(false)
    }
  }, [studentGroup, user])

  const addProposal = () => {
    setProposals([...proposals, { id: Date.now().toString(), title: '', description: '' }])
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
      const proposalsData: ProposalFormData[] = proposals.map(p => ({
        title: p.title.trim(),
        description: p.description.trim(),
        targetProjectId: p.targetProjectId,
      }))

      const studentGroupId = studentGroup ? String(studentGroup.id) : undefined
      await createBatchMutation.mutateAsync({
        proposals: proposalsData,
        studentGroupId,
      })
      
      toastSuccess(t('proposal.submitSuccess'))
      onSuccess?.()
    } catch (error: any) {
      // Check if error is due to missing group
      if (error.response?.data?.code === 'NO_GROUP') {
        const message = error.response?.data?.message || t('proposal.groupRequiredMessage')
        toastError(message)
        // Don't show generic error for this case, the modal will handle it
        return
      }
      
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
    isSubmitting: isSubmitting || createBatchMutation.isPending,
    isLocked,
    isPeriodActive,
    isPeriodLoading,
    isLoadingLock: false, // No longer needed, but keep for backward compatibility
  }
}
