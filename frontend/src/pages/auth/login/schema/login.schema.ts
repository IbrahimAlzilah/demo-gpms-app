import { z } from "zod";

export const loginSchema = (t: (key: string) => string) => {
  return z.object({
    email: z
      .string()
      .min(1, t("auth.validation.emailRequired"))
      .email(t("auth.validation.emailInvalid")),
    password: z
      .string()
      .min(1, t("auth.validation.passwordRequired"))
      .min(6, t("auth.validation.passwordMinLength")),
  });
};

export type LoginSchema = z.infer<ReturnType<typeof loginSchema>>;
