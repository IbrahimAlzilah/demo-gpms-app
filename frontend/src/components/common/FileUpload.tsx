import { useState, useRef } from 'react'
import { Upload, X, File, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatFileSize } from '@/lib/utils/format'

interface FileUploadProps {
  accept?: string
  maxSize?: number // in bytes
  multiple?: boolean
  onFilesSelected?: (files: File[]) => void
  onChange?: (files: File[]) => void
  files?: File[]
  value?: File[]
  className?: string
  disabled?: boolean
}

export function FileUpload({
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
  onFilesSelected,
  onChange,
  files: controlledFiles,
  value,
  className,
  disabled,
}: FileUploadProps) {
  const { t } = useTranslation()
  const [internalFiles, setInternalFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Use controlled files if provided, otherwise use internal state
  const files = controlledFiles ?? value ?? internalFiles
  const isControlled = controlledFiles !== undefined || value !== undefined

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return

    const newFiles = Array.from(fileList).filter((file) => {
      if (file.size > maxSize) {
        alert(t('fileUpload.fileExceedsSize', { name: file.name, size: formatFileSize(maxSize) }))
        return false
      }
      return true
    })

    const updatedFiles = multiple ? [...files, ...newFiles] : newFiles
    
    if (isControlled) {
      onChange?.(updatedFiles)
      onFilesSelected?.(updatedFiles)
    } else {
      setInternalFiles(updatedFiles)
      onChange?.(updatedFiles)
      onFilesSelected?.(updatedFiles)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    
    if (isControlled) {
      onChange?.(updatedFiles)
      onFilesSelected?.(updatedFiles)
    } else {
      setInternalFiles(updatedFiles)
      onChange?.(updatedFiles)
      onFilesSelected?.(updatedFiles)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
        <p className="mb-2 text-sm font-medium">
          {t('fileUpload.dragDrop')}
        </p>
        <p className="mb-4 text-xs text-muted-foreground">
          {t('fileUpload.maxSize')} {formatFileSize(maxSize)}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          {t('fileUpload.selectFiles')}
        </Button>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 rounded-lg border bg-card p-3"
            >
              <File className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-success" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFile(index)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

