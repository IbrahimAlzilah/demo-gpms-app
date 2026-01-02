import { z } from "zod";

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
