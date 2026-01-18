import { z } from "zod"

// Proposal Review Schema
export const proposalReviewSchema = (
  t: (key: string) => string,
  action: "approve" | "reject" | "modify"
) => {
  const baseSchema = z.object({
    notes: z.string().optional(),
  })

  if (action === "modify") {
    return baseSchema.extend({
      notes: z
        .string()
        .min(1, t("committee.proposal.modifyNotesRequired"))
        .trim(),
    })
  }

  return baseSchema
}

export type ProposalReviewSchema = z.infer<
  ReturnType<typeof proposalReviewSchema>
>
