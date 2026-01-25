import { z } from 'zod'

/**
 * Proposal form validation schema
 */
export const proposalFormSchema = (
  t: (key: string) => string, 
  requireGroup = false,
  isRegistrationWindow = false,
  hasGroup = false
) => {
  return z.object({
    title: z
      .string()
      .min(1, t('proposal.validation.titleRequired'))
      .min(5, t('proposal.validation.titleMinLength'))
      .max(200, t('proposal.validation.titleMaxLength')),
    description: z
      .string()
      .min(1, t('proposal.validation.descriptionRequired'))
      .min(50, t('proposal.validation.descriptionMinLength')),
    studentGroupId: requireGroup 
      ? z.string().min(1, hasGroup 
          ? t('proposal.validation.groupRequiredWhenInGroup')
          : isRegistrationWindow 
            ? t('proposal.validation.groupRequiredDuringRegistration')
            : t('proposal.validation.groupRequiredWhenInGroup'))
      : z.string().optional(),
    // targetProjectId is required during registration window, optional during proposal submission
    targetProjectId: isRegistrationWindow 
      ? z.string().min(1, t('proposal.validation.targetProjectRequired') || 'Target project is required during registration window')
      : z.string().optional(),
  })
}

export type ProposalFormSchema = z.infer<ReturnType<typeof proposalFormSchema>>
