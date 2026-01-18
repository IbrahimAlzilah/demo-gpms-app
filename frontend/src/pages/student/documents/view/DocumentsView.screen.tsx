import { useTranslation } from 'react-i18next'
import { ModalDialog, StatusBadge, LoadingSpinner } from '@/components/common'
import { Button } from '@/components/ui'
import { Download, MessageSquare, AlertCircle } from 'lucide-react'
import { formatDate, formatFileSize } from '@/lib/utils/format'
import { useDocumentsView } from './DocumentsView.hook'
import { documentService } from '../api/document.service'

interface DocumentsViewProps {
  documentId: string
  open: boolean
  onClose: () => void
}

export function DocumentsView({ documentId, open, onClose }: DocumentsViewProps) {
  const { t } = useTranslation()
  const { document, isLoading, error } = useDocumentsView(documentId)

  if (isLoading) {
    return (
      <ModalDialog open={open} onOpenChange={onClose} title={t('document.details')}>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </ModalDialog>
    )
  }

  if (error || !document) {
    return (
      <ModalDialog open={open} onOpenChange={onClose} title={t('document.details')}>
        <div className="text-center py-8 text-destructive">
          <AlertCircle className="h-5 w-5 mx-auto mb-2" />
          {t('document.loadError')}
        </div>
      </ModalDialog>
    )
  }

  return (
    <ModalDialog open={open} onOpenChange={onClose} title={document.fileName}>
      <div className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <StatusBadge status={`reviewStatus_${document.reviewStatus}`} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">{t('document.documentType')}</p>
              <p className="text-sm font-medium">{document.type}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('document.size')}</p>
              <p className="text-sm font-medium">{formatFileSize(document.fileSize)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('document.submittedAt')}</p>
              <p className="text-sm font-medium">{formatDate(document.createdAt)}</p>
            </div>
            {document.reviewedAt && (
              <div>
                <p className="text-xs text-muted-foreground">{t('document.reviewedAt')}</p>
                <p className="text-sm font-medium">{formatDate(document.reviewedAt)}</p>
              </div>
            )}
          </div>

          {document.reviewComments && (
            <div className="rounded-lg bg-muted p-4 border border-muted-foreground/20">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">{t('document.reviewComments')}</h4>
              </div>
              <p className="text-sm whitespace-pre-wrap">{document.reviewComments}</p>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await documentService.download(document.id, document.fileName)
                } catch (error) {
                  console.error('Download failed:', error)
                }
              }}
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              {t('document.download')}
            </Button>
            <Button variant="outline" onClick={onClose}>
              {t('common.close')}
            </Button>
          </div>
        </div>
      </div>
    </ModalDialog>
  )
}
