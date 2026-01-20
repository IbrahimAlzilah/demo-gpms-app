import { z } from 'zod'

/**
 * Proposal form validation schema
 */
export const proposalFormSchema = (t: (key: string) => string, requireGroup = false) => {
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
    requirements: z.string().optional(),
    proposedSupervisorId: z.string().optional(),
    studentGroupId: requireGroup 
      ? z.string().min(1, t('proposal.validation.groupRequired'))
      : z.string().optional(),
    targetProjectId: z.string().optional(),
    teamMembers: z.array(
      z.object({
        name: z.string().min(1, 'Member name is required'),
        role: z.string().min(1, 'Role is required'),
      })
    ).optional(),
  })
}

export type ProposalFormSchema = z.infer<ReturnType<typeof proposalFormSchema>>
