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

// Document Upload Schema
export const documentUploadSchema = (t: (key: string) => string) => {
  return z.object({
    documentType: z.enum(
      ["chapters", "final_report", "code", "presentation", "other"],
      {
        message: t("document.validation.typeRequired"),
      }
    ),
    file: z
      .custom<File>((val) => val instanceof File, {
        message: t("document.validation.fileRequired"),
      })
      .refine(
        (file) => file && file.size <= 10 * 1024 * 1024,
        t("document.fileTooLarge"))
  });
};

export type DocumentUploadSchema = z.infer<ReturnType<typeof documentUploadSchema>>;

// Group Invite Schema
export const groupInviteSchema = (t: (key: string) => string) => {
  return z.object({
    inviteeId: z
      .string()
      .min(1, t("group.validation.studentIdRequired"))
      .trim(),
    message: z.string().optional(),
  });
};

export type GroupInviteSchema = z.infer<ReturnType<typeof groupInviteSchema>>;

// Group Join Schema
export const groupJoinSchema = (t: (key: string) => string) => {
  return z.object({
    joinGroupId: z
      .string()
      .min(1, t("group.validation.groupIdRequired"))
      .trim(),
  });
};

export type GroupJoinSchema = z.infer<ReturnType<typeof groupJoinSchema>>;

