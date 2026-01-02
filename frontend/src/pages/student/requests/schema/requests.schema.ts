import { z } from "zod";

// Request Submission Form Schema
export const requestSubmissionSchema = (t: (key: string) => string) => {
  return z.object({
    type: z.enum(
      ["change_supervisor", "change_group", "change_project", "other"],
      {
        message: t("request.validation.typeRequired"),
      }
    ),
    reason: z
      .string()
      .min(1, t("request.validation.reasonRequired"))
      .min(20, t("request.validation.reasonMinLength")),
    projectId: z.string().optional(),
  });
};

export type RequestSubmissionSchema = z.infer<ReturnType<typeof requestSubmissionSchema>>;
