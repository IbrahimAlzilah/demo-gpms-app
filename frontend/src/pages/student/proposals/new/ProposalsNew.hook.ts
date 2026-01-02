import { useProposalForm } from '../hooks/useProposalForm'
import { useCreateProposal } from '../hooks/useProposalOperations'
import { useAuthStore } from '@/features/auth/store/auth.store'

export function useProposalsNew(onSuccess?: () => void) {
  const { user } = useAuthStore()
  const createProposal = useCreateProposal()

  const form = useProposalForm({
    onSubmit: async (data) => {
      if (!user) {
        throw new Error('User not authenticated')
      }

      await createProposal.mutateAsync({
        ...data,
        submitterId: user.id,
      })

      onSuccess?.()
    },
  })

  return {
    form,
    isSubmitting: createProposal.isPending,
  }
}
