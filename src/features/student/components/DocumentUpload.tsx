import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useUploadDocument } from '../hooks/useDocuments'
import { usePeriodCheck } from '../../../hooks/usePeriodCheck'
import { Button } from '../../../components/ui/button'
import { Label } from '../../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { AlertCircle, Upload, File, Loader2, CheckCircle2, Calendar, AlertTriangle } from 'lucide-react'
import { formatFileSize } from '../../../lib/utils/format'
import type { DocumentType } from '../../../types/request.types'

interface DocumentUploadProps {
  projectId: string
  onSuccess?: () => void
}

export function DocumentUpload({ projectId, onSuccess }: DocumentUploadProps) {
  const { t } = useTranslation()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<DocumentType>('chapters')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadDocument = useUploadDocument()
  const { isPeriodActive, isLoading: periodLoading } = usePeriodCheck('document_submission')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const documentTypeOptions: { value: DocumentType; label: string }[] = [
    { value: 'chapters', label: t('document.type.chapters') || 'فصول المشروع' },
    { value: 'final_report', label: t('document.type.finalReport') || 'التقرير النهائي' },
    { value: 'code', label: t('document.type.code') || 'الأكواد' },
    { value: 'presentation', label: t('document.type.presentation') || 'العرض' },
    { value: 'other', label: t('document.type.other') || 'أخرى' },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        setError(t('document.fileTooLarge') || `الملف كبير جداً (الحد الأقصى ${formatFileSize(maxSize)})`)
        return
      }
      setSelectedFile(file)
      setError('')
    }
  }

  const handleSubmit = async () => {
    if (!isPeriodActive) {
      setError(t('document.periodClosed') || 'فترة تسليم الوثائق غير مفتوحة حالياً')
      return
    }

    if (!selectedFile) {
      setError(t('document.validation.fileRequired') || 'يرجى اختيار ملف')
      return
    }

    setError('')
    setSuccess(false)

    try {
      await uploadDocument.mutateAsync({
        projectId,
        file: selectedFile,
        type: documentType,
      })
      setSuccess(true)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setTimeout(() => {
        onSuccess?.()
      }, 2000)
    } catch (err) {
      setError(
        err instanceof Error 
          ? err.message 
          : t('document.uploadError') || 'فشل رفع الملف'
      )
    }
  }

  if (periodLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isPeriodActive) {
    return (
      <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
        <div>
          <p className="text-sm font-medium text-warning-foreground">
            {t('document.periodClosed') || 'فترة تسليم الوثائق غير مفتوحة حالياً'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('document.periodClosedDescription') || 'يرجى الانتظار حتى يتم فتح فترة التسليم'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 p-3 text-sm text-success bg-success/10 border border-success/20 rounded-md">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            {t('document.uploadSuccess') || 'تم رفع الملف بنجاح وسيتم مراجعته من قبل المشرف'}
          </span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="documentType">
          {t('document.type') || 'نوع الوثيقة'} <span className="text-destructive">*</span>
        </Label>
        <Select
          value={documentType}
          onValueChange={(value) => setDocumentType(value as DocumentType)}
        >
          <SelectTrigger id="documentType">
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">
          {t('document.selectFile') || 'اختر الملف'} <span className="text-destructive">*</span>
        </Label>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            id="file"
            type="file"
            onChange={handleFileChange}
            className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
            accept=".pdf,.doc,.docx,.zip,.rar"
            aria-invalid={!!error}
          />
        </div>
        {selectedFile && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border">
            <File className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {t('document.fileUploadHint') || 'يمكن رفع ملفات PDF, Word, أو أرشيف. الحد الأقصى 10MB'}
        </p>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!selectedFile || uploadDocument.isPending || !isPeriodActive}
        className="w-full"
      >
        {uploadDocument.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('document.uploading') || 'جاري الرفع...'}
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            {t('document.upload') || 'رفع الملف'}
          </>
        )}
      </Button>
    </div>
  )
}

