import { z } from "zod";

export const authSchema = (t: (key: string) => string) => {
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

export type AuthSchema = z.infer<ReturnType<typeof authSchema>>;

export const forgetPasswordSchema = (t: (key: string) => string) => {
  return z.object({
    email: z
      .string()
      .min(1, t("auth.validation.emailRequired"))
      .email(t("auth.validation.emailInvalid")),
  });
};

export type ForgetPasswordSchema = z.infer<
  ReturnType<typeof forgetPasswordSchema>
>;
