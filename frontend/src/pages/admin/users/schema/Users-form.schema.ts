import { z } from 'zod'

/**
 * User form validation schema
 */
export const userFormSchema = (t: (key: string) => string) => {
  return z.object({
    name: z
      .string()
      .min(1, t('user.validation.nameRequired'))
      .min(2, t('user.validation.nameMinLength')),
    email: z
      .string()
      .email(t('user.validation.emailInvalid'))
      .optional()
      .or(z.literal('')),
    role: z.enum(
      [
        'student',
        'supervisor',
        'discussion_committee',
        'projects_committee',
        'admin',
      ],
      {
        message: t('user.validation.roleRequired'),
      }
    ),
    status: z.enum(['active', 'inactive', 'suspended'], {
      message: t('user.validation.statusRequired'),
    }),
    studentId: z.string().optional(),
    empId: z.string().optional(),
    department: z.string().optional(),
  })
}

export type UserFormSchema = z.infer<ReturnType<typeof userFormSchema>>
