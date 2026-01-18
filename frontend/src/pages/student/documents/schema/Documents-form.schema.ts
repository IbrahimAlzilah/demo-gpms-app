import { z } from 'zod'

/**
 * Document upload form schema
 */
export const documentUploadSchema = (t: (key: string) => string) => {
  return z.object({
    documentType: z.enum(
      ['chapters', 'final_report', 'code', 'presentation', 'other'],
      {
        message: t('document.validation.typeRequired'),
      }
    ),
    file: z
      .custom<File>((val) => val instanceof File, {
        message: t('document.validation.fileRequired'),
      })
      .refine(
        (file) => file && file.size <= 10 * 1024 * 1024,
        t('document.fileTooLarge')
      ),
  })
}

export type DocumentUploadSchema = z.infer<ReturnType<typeof documentUploadSchema>>
