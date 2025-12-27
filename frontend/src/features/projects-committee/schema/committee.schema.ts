import { z } from "zod";
import type { PeriodType } from "@/types/period.types";

// Time Period Form Schema
export const timePeriodSchema = (t: (key: string) => string) => {
  return z
    .object({
      name: z.string().min(1, t("committee.periods.nameRequired")),
      type: z.enum(
        [
          "proposal_submission",
          "project_registration",
          "document_submission",
          "supervisor_evaluation",
          "committee_evaluation",
          "final_discussion",
          "general",
        ],
        {
          required_error: t("committee.periods.typeRequired"),
        }
      ),
      startDate: z.string().min(1, t("committee.periods.startDateRequired")),
      endDate: z.string().min(1, t("committee.periods.endDateRequired")),
      academicYear: z.string().optional(),
      semester: z.string().optional(),
    })
    .refine(
      (data) => {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        return startDate < endDate;
      },
      {
        message: t("committee.periods.invalidDateRange"),
        path: ["endDate"],
      }
    );
};

export type TimePeriodSchema = z.infer<ReturnType<typeof timePeriodSchema>>;

// Proposal Review Schema
export const proposalReviewSchema = (
  t: (key: string) => string,
  action: "approve" | "reject" | "modify"
) => {
  const baseSchema = z.object({
    notes: z.string().optional(),
  });

  if (action === "modify") {
    return baseSchema.extend({
      notes: z
        .string()
        .min(1, t("committee.proposal.modifyNotesRequired"))
        .trim(),
    });
  }

  return baseSchema;
};

export type ProposalReviewSchema = z.infer<
  ReturnType<typeof proposalReviewSchema>
>;
