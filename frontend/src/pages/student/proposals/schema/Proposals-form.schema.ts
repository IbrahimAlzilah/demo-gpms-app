import { z } from 'zod'

/**
 * Proposal form validation schema
 */
export const proposalFormSchema = (t: (key: string) => string) => {
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
    objectives: z
      .string()
      .min(1, t('proposal.validation.objectivesRequired'))
      .min(30, t('proposal.validation.objectivesMinLength')),
    methodology: z.string().optional(),
    expectedOutcomes: z.string().optional(),
  })
}

export type ProposalFormSchema = z.infer<ReturnType<typeof proposalFormSchema>>
