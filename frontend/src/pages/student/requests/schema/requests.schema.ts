import { z } from "zod";

// Request Submission Form Schema
export const requestSubmissionSchema = (t: (key: string) => string) => {
  return z
    .object({
      type: z.enum(
        [
          "change_supervisor",
          "change_group",
          "change_project",
          "change_project_title",
          "other",
        ],
        { message: t("request.validation.typeRequired") },
      ),
      reason: z
        .string()
        .min(1, t("request.validation.reasonRequired"))
        .min(20, t("request.validation.reasonMinLength")),
      projectId: z.string().optional(),
      title: z.string().max(255).optional(),
      proposedSupervisorId: z.string().optional(),
      targetGroupId: z.string().optional(),
      targetProjectId: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.type === "change_supervisor" && !data.proposedSupervisorId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("request.validation.proposedSupervisorRequired"),
          path: ["proposedSupervisorId"],
        });
      }
      if (data.type === "change_group" && !data.targetGroupId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("request.validation.targetGroupRequired"),
          path: ["targetGroupId"],
        });
      }
      if (data.type === "change_project" && !data.targetProjectId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("request.validation.targetProjectRequired"),
          path: ["targetProjectId"],
        });
      }
      if (
        (data.type === "change_project_title" || data.type === "other") &&
        !(data.title ?? "").trim()
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("request.validation.titleRequired"),
          path: ["title"],
        });
      }
    });
};

export type RequestSubmissionSchema = z.infer<
  ReturnType<typeof requestSubmissionSchema>
>;
