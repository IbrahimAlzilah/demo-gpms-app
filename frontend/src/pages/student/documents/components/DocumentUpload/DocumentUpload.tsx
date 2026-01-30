import { useMemo, useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUploadDocument } from '../../hooks/useDocumentOperations'
import { useDocuments } from '../../hooks/useDocuments'
import { usePeriodCheck } from '@/hooks/usePeriodCheck'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, Upload, Loader2, CheckCircle2, Clock } from 'lucide-react'
import { formatFileSize } from '@/lib/utils/format'
import { documentUploadSchema, type DocumentUploadSchema } from '../../schema'
import type { DocumentType } from '@/types/request.types'
import { DocumentGuidance } from '../DocumentGuidance'
import { toast } from 'sonner'

interface DocumentUploadProps {
  projectId: string
  onSuccess?: () => void
  /** When set, upload is for this chapter (new, replace pending, or resubmit rejected). */
  initialChapterNumber?: number
  /** True when replacing a pending chapter (edit while under review); false when resubmitting rejected. */
  replaceMode?: boolean
}

export function DocumentUpload({ projectId, onSuccess, initialChapterNumber, replaceMode }: DocumentUploadProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const uploadDocument = useUploadDocument()
  const { data: existingDocuments } = useDocuments(projectId)
  // Check if any document submission period is active
  const { isPeriodActive: isPhase1Active, isLoading: isPhase1Loading } = usePeriodCheck('chapter_submission_phase_1')
  const { isPeriodActive: isPhase2Active, isLoading: isPhase2Loading } = usePeriodCheck('chapter_submission_phase_2')
  const { isPeriodActive: isFinalActive, isLoading: isFinalLoading } = usePeriodCheck('final_project_document_submission')
  const isPeriodActive = isPhase1Active || isPhase2Active || isFinalActive
  const periodLoading = isPhase1Loading || isPhase2Loading || isFinalLoading
  const hasProject = !!projectId

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<DocumentUploadSchema>({
    resolver: zodResolver(documentUploadSchema(t)),
    defaultValues: {
      documentType: 'chapters',
    },
  })

  const isResubmission = initialChapterNumber !== undefined
  useEffect(() => {
    if (isResubmission) setValue('documentType', 'chapters')
  }, [isResubmission, setValue])

  // const selectedFile = watch('file')
  const documentType = watch('documentType')

  const allowedDocumentTypes: DocumentType[] = useMemo(() => {
    const types: DocumentType[] = []
    if (isPhase1Active || isPhase2Active) {
      types.push('chapters')
    }
    if (isFinalActive) {
      types.push('final_report', 'code', 'presentation', 'other')
    }
    return types
  }, [isPhase1Active, isPhase2Active, isFinalActive])

  const documentTypeOptions = (
    [
      { value: 'chapters' as DocumentType, label: t('document.type.chapters') },
      { value: 'final_report' as DocumentType, label: t('document.type.finalReport') },
      { value: 'code' as DocumentType, label: t('document.type.code') },
      { value: 'presentation' as DocumentType, label: t('document.type.presentation') },
      { value: 'other' as DocumentType, label: t('document.type.other') },
    ] as const
  ).filter((option): option is { value: DocumentType; label: string } =>
    allowedDocumentTypes.includes(option.value)
  )

  // Determine the next allowed chapter based on existing documents (or use initialChapterNumber for resubmission)
  const nextAllowedChapter = useMemo(() => {
    if (initialChapterNumber !== undefined) return initialChapterNumber

    if (!existingDocuments) return 1

    const chapterDocs = existingDocuments.filter(
      (doc) => doc.type === 'chapters' && typeof doc.chapterNumber === 'number'
    )

    // If there is a pending chapter, do not suggest a new one (backend will block anyway)
    const pending = chapterDocs.find((doc) => doc.reviewStatus === 'pending')
    if (pending?.chapterNumber) {
      return pending.chapterNumber
    }

    const approvedChapters = new Set(
      chapterDocs
        .filter((doc) => doc.reviewStatus === 'approved')
        .map((doc) => doc.chapterNumber as number)
    )

    for (let chapter = 1; chapter <= 6; chapter++) {
      if (!approvedChapters.has(chapter)) {
        return chapter
      }
    }

    // All chapters approved
    return undefined
  }, [existingDocuments, initialChapterNumber])



  const onSubmit = async (data: DocumentUploadSchema) => {
    if (!isPeriodActive) {
      toast.error(t('document.windowClosed'))
      return
    }

    try {
      const chapterNumber =
        data.documentType === 'chapters'
          ? (initialChapterNumber ?? nextAllowedChapter)
          : undefined

      await uploadDocument.mutateAsync({
        projectId,
        file: data.file,
        type: data.documentType,
        chapterNumber,
      })

      const isResubmit = initialChapterNumber !== undefined && !replaceMode
      toast.success(isResubmit ? t('document.resubmitSuccess') : t('document.uploadSuccess'))
      reset()
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setTimeout(() => {
        onSuccess?.()
      }, 1500)
    } catch (error: unknown) {
      // Extract error message from axios response
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (error as Error)?.message ||
        t('document.uploadError')
      toast.error(errorMessage)
    }
  }

  if (periodLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Guidance Section */}
      <DocumentGuidance
        isPhase1Active={isPhase1Active}
        isPhase2Active={isPhase2Active}
        isFinalActive={isFinalActive}
        hasProject={hasProject}
        t={t}
      />

      {!isPeriodActive && (
        <div className="p-6 text-center border rounded-lg bg-muted/30">
          <Clock className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold text-lg mb-2">{t('document.windowClosed')}</h3>
          <p className="text-muted-foreground">{t('document.windowClosedDesc')}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errors.file && (
          <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{errors.file.message}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="documentType">
            {t('document.documentType')} <span className="text-destructive">*</span>
          </Label>
          <Select
            value={documentType}
            onValueChange={(value) =>
              setValue('documentType', value as DocumentUploadSchema['documentType'])
            }
            disabled={!isPeriodActive || !hasProject || isResubmission}
          >
            <SelectTrigger
              id="documentType"
              className={errors.documentType ? 'border-destructive' : ''}
              disabled={!isPeriodActive || !hasProject || isResubmission}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {documentTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {documentType === 'chapters' && nextAllowedChapter && (
            <div className={cn(
              'p-3 rounded-lg border',
              initialChapterNumber !== undefined
                ? replaceMode
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : 'bg-amber-500/10 border-amber-500/30'
                : 'bg-primary/5 border-primary/20'
            )}>
              {initialChapterNumber !== undefined ? (
                replaceMode ? (
                  <>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                      {t('document.uploadChapters.replaceChapter', { chapter: nextAllowedChapter })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('document.uploadChapters.replaceChapterDesc')}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      {t('document.uploadChapters.resubmittingChapter', { chapter: nextAllowedChapter })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('document.uploadChapters.resubmittingChapterDesc')}
                    </p>
                  </>
                )
              ) : (
                <>
                  <p className="text-sm font-medium text-primary">
                    {t('document.uploadChapters.chapterWillSubmit', { chapter: nextAllowedChapter })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('document.uploadChapters.chapterWillSubmitDesc')}
                  </p>
                </>
              )}
            </div>
          )}
          {documentType === 'chapters' && !nextAllowedChapter && (
            <div className="p-3 rounded-lg bg-muted border border-muted-foreground/20">
              <p className="text-sm text-muted-foreground">
                {t('document.uploadChapters.allChaptersCompleted')}
              </p>
            </div>
          )}
          {errors.documentType && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.documentType.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">
            {t('document.selectFile')} <span className="text-destructive">*</span>
          </Label>

          <Controller
            name="file"
            control={control}
            render={({ field: { onChange, name, onBlur, value } }) => (
              <>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
                    isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:bg-muted/50",
                    errors.file && "border-destructive/50 bg-destructive/5",
                    value && "border-success/50 bg-success/5"
                  )}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragActive(true);
                  }}
                  onDragLeave={() => setIsDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragActive(false);
                    if (e.dataTransfer.files?.[0]) {
                      onChange(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    name={name}
                    onBlur={onBlur}
                    ref={fileInputRef}
                    id="file"
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) onChange(file)
                    }}
                    accept=".pdf,.doc,.docx,.zip,.rar"
                    disabled={!isPeriodActive || !hasProject || uploadDocument.isPending}
                  />

                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className={cn(
                      "h-12 w-12 rounded-full flex items-center justify-center transition-colors",
                      value ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    )}>
                      {value ? <CheckCircle2 className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {value ? value.name : t('document.clickOrDragToUpload')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {value ? formatFileSize(value.size) : t('document.fileUploadHint')}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          />
        </div>


        <Button
          type="submit"
          disabled={uploadDocument.isPending || !isPeriodActive || !hasProject}
          className="w-full"
        >
          {uploadDocument.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('document.uploading')}
            </>
          ) : (
            <>
              <Upload className="size-4" />
              {t('document.upload', { defaultValue: 'Upload File' })}
            </>
          )}
        </Button>
      </form >
    </div >
  )
}
