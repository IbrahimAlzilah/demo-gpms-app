import { z } from "zod";

// User Form Schema
export const userSchema = (t: (key: string) => string) => {
  return z.object({
    name: z
      .string()
      .min(1, t("user.validation.nameRequired"))
      .min(2, t("user.validation.nameMinLength")),
    email: z
      .string()
      .min(1, t("user.validation.emailRequired"))
      .email(t("user.validation.emailInvalid")),
    role: z.enum(
      [
        "student",
        "supervisor",
        "discussion_committee",
        "projects_committee",
        "admin",
      ],
      {
        message: t("user.validation.roleRequired"),
      }
    ),
    status: z.enum(["active", "inactive", "suspended"], {
      message: t("user.validation.statusRequired"),
    }),
    studentId: z.string().optional(),
    department: z.string().optional(),
    phone: z
      .string()
      .regex(/^[0-9+\-\s()]+$/, t("user.validation.phoneInvalid"))
      .optional()
      .or(z.literal("")),
  });
};

export type UserSchema = z.infer<ReturnType<typeof userSchema>>;
