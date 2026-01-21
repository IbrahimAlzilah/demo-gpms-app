import { z } from 'zod'

/**
 * Proposal creation form validation schema for committee
 */
export const proposalCreateSchema = (t: (key: string) => string) =>
  z.object({
    submitterId: z.string().min(1, t('proposal.validation.submitterRequired')),
    title: z
      .string()
      .min(1, t('proposal.validation.titleRequired'))
      .min(5, t('proposal.validation.titleMinLength'))
      .max(200, t('proposal.validation.titleMaxLength')),
    description: z
      .string()
      .min(1, t('proposal.validation.descriptionRequired'))
      .min(50, t('proposal.validation.descriptionMinLength')),
  })

export type ProposalCreateSchema = z.infer<ReturnType<typeof proposalCreateSchema>>
