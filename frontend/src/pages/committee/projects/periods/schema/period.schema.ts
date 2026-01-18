import { z } from "zod"

// Time Period Form Schema
export const timePeriodSchema = (t: (key: string) => string, isEditMode = false) => {
  const baseSchema = z.object({
    name: z.string().min(1, t("committee.periods.nameRequired")),
    type: z.enum(
      [
        "proposal_submission",
        "project_registration",
        "document_submission",
        "supervisor_evaluation",
        "committee_evaluation",
        "discussion_evaluation",
        "final_discussion",
        "grade_approval",
        "general",
      ],
      {
        message: t("committee.periods.typeRequired"),
      }
    ),
    startDate: z.string().min(1, t("committee.periods.startDateRequired")),
    endDate: z.string().min(1, t("committee.periods.endDateRequired")),
    academicYear: z.string().optional(),
    semester: z.string().optional(),
  })

  // Add isActive field only in edit mode
  if (isEditMode) {
    return baseSchema
      .extend({
        isActive: z.boolean().optional(),
      })
      .refine(
        (data) => {
          const startDate = new Date(data.startDate)
          const endDate = new Date(data.endDate)
          return startDate < endDate
        },
        {
          message: t("committee.periods.invalidDateRange"),
          path: ["endDate"],
        }
      )
  }

  return baseSchema.refine(
    (data) => {
      const startDate = new Date(data.startDate)
      const endDate = new Date(data.endDate)
      return startDate < endDate
    },
    {
      message: t("committee.periods.invalidDateRange"),
      path: ["endDate"],
    }
  )
}

export type TimePeriodSchema = z.infer<ReturnType<typeof timePeriodSchema>>
