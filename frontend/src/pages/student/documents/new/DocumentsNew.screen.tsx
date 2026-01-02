import { ModalDialog } from '@/components/common'
import { DocumentUpload } from '../components/DocumentUpload'
import { useTranslation } from 'react-i18next'

interface DocumentsNewProps {
  projectId: string
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function DocumentsNew({ projectId, open, onClose, onSuccess }: DocumentsNewProps) {
  const { t } = useTranslation()

  const handleSuccess = () => {
    onSuccess?.()
  }

  return (
    <ModalDialog open={open} onOpenChange={onClose} title={t('document.uploadNew')}>
      <DocumentUpload projectId={projectId} onSuccess={handleSuccess} />
    </ModalDialog>
  )
}
