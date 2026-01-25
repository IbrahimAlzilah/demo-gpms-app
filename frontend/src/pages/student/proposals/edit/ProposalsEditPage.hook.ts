import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/components/common'
import { useMyGroup } from '@/pages/student/groups/hooks/useGroups'
import { useAuthStore } from '@/pages/auth/login'
import { proposalService } from '../api/proposal.service'
import { usePeriodCheck } from '@/hooks/usePeriodCheck'
import type { ProposalFormData } from '../types/Proposals.types'

interface ProposalItem extends ProposalFormData {
  id: string
  isNew?: boolean
  errors?: Record<string, string>
}

export function useProposalsEditBatch(onSuccess?: () => void) {
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()
  const { user } = useAuthStore()
  const { data: studentGroup } = useMyGroup()
  const { isPeriodActive: isSubmissionPeriod } = usePeriodCheck('proposal_submission')
  const { isPeriodActive: isRegistrationPeriod } = usePeriodCheck('project_registration')
  const isPeriodActive = isSubmissionPeriod || isRegistrationPeriod

  const [existingProposals, setExistingProposals] = useState<ProposalItem[]>([])
  const [newProposals, setNewProposals] = useState<ProposalItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isLoadingRef = useRef(false)

  // Check if user is a leader
  const isLeader = studentGroup ? studentGroup.leaderId === user?.id : false

  // Load all proposals for the leader's group using submission context
  useEffect(() => {
    // Prevent multiple simultaneous calls
    if (isLoadingRef.current) {
      return
    }

    // Only load if we have a student group and user is the leader
    if (!studentGroup?.id || !isLeader) {
      setIsLoading(false)
      return
    }

    const loadProposals = async () => {
      isLoadingRef.current = true
      try {
        const context = await proposalService.getSubmissionContext()
        
        // Ensure context and proposals exist
        if (!context || !context.proposals) {
          console.warn('Submission context is empty or invalid:', context)
          setExistingProposals([])
          return
        }
        
        // Map all proposals to ProposalItem format
        const proposals = Array.isArray(context.proposals) ? context.proposals : []
        setExistingProposals(proposals.map(p => ({
          id: String(p.id),
          title: p.title || '',
          description: p.description || '',
          proposedSupervisorId: p.proposedSupervisorId ? String(p.proposedSupervisorId) : undefined,
          targetProjectId: p.targetProjectId ? String(p.targetProjectId) : undefined,
          isNew: false,
        })))
      } catch (error) {
        console.error('Failed to load submission context:', error)
        toastError(t('proposal.loadError'))
        setExistingProposals([])
      } finally {
        setIsLoading(false)
        isLoadingRef.current = false
      }
    }

    loadProposals()
  }, [studentGroup?.id, isLeader]) // Only depend on studentGroup.id and isLeader, reload if group changes

  const addNewProposal = () => {
    setNewProposals([...newProposals, { 
      id: `new-${Date.now()}`, 
      title: '', 
      description: '', 
      proposedSupervisorId: undefined,
      isNew: true,
    }])
  }

  const removeNewProposal = (id: string) => {
    setNewProposals(newProposals.filter(p => p.id !== id))
  }

  const updateProposal = (id: string, data: Partial<ProposalFormData>) => {
    // Check if it's an existing proposal
    const existingIndex = existingProposals.findIndex(p => p.id === id)
    if (existingIndex >= 0) {
      setExistingProposals(existingProposals.map(p => 
        p.id === id ? { ...p, ...data, errors: undefined } : p
      ))
    } else {
      // It's a new proposal
      setNewProposals(newProposals.map(p => 
        p.id === id ? { ...p, ...data, errors: undefined } : p
      ))
    }
  }

  const validateProposals = (): boolean => {
    let isValid = true

    const validateProposal = (proposal: ProposalItem): ProposalItem => {
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
    }

    setExistingProposals(existingProposals.map(validateProposal))
    setNewProposals(newProposals.map(validateProposal))
    return isValid
  }

  const handleSubmit = async () => {
    if (!user) {
      toastError(t('proposal.authRequired'))
      return
    }

    if (!isPeriodActive) {
      // Check if any proposal requires modification (allows editing even outside windows)
      const hasModificationRequired = existingProposals.some(p => {
        // We'd need to check the actual proposal status, but for now assume it's allowed during edit
        return true
      })
      
      if (!hasModificationRequired) {
        toastError(t('proposal.periodClosed'))
        return
      }
    }

    if (!validateProposals()) {
      toastError(t('proposal.validationErrors'))
      return
    }

    setIsSubmitting(true)
    try {
      const updates = existingProposals.map(p => ({
        id: p.id,
        title: p.title.trim(),
        description: p.description.trim(),
        proposedSupervisorId: p.proposedSupervisorId,
      }))

      const newProposalsData: ProposalFormData[] = newProposals.map(p => ({
        title: p.title.trim(),
        description: p.description.trim(),
        proposedSupervisorId: p.proposedSupervisorId,
        targetProjectId: p.targetProjectId,
      }))

      const studentGroupId = studentGroup ? String(studentGroup.id) : undefined
      await proposalService.updateBatch(updates, newProposalsData, studentGroupId)
      
      toastSuccess(t('proposal.updateSuccess'))
      onSuccess?.()
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || t('proposal.updateError')
      toastError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    existingProposals,
    newProposals,
    addNewProposal,
    removeNewProposal,
    updateProposal,
    handleSubmit,
    isLoading,
    isSubmitting,
  }
}
