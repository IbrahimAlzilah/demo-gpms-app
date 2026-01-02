import { z } from "zod";

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
