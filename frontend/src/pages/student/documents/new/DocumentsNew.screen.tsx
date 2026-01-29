import { ModalDialog } from '@/components/common'
import { DocumentUpload } from '../components/DocumentUpload'
import { useTranslation } from 'react-i18next'

interface DocumentsNewProps {
  projectId: string
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  /** When set, form is for resubmitting or replacing this chapter. */
  initialChapterNumber?: number
  /** True when replacing a pending chapter (edit while under review). */
  replaceMode?: boolean
}

export function DocumentsNew({ projectId, open, onClose, onSuccess, initialChapterNumber, replaceMode }: DocumentsNewProps) {
  const { t } = useTranslation()

  const handleSuccess = () => {
    onSuccess?.()
  }

  return (
    <ModalDialog open={open} onOpenChange={onClose} title={t('document.uploadNew')} className="max-w-2xl">
      <DocumentUpload
        projectId={projectId}
        onSuccess={handleSuccess}
        initialChapterNumber={initialChapterNumber}
        replaceMode={replaceMode}
      />
    </ModalDialog>
  )
}
