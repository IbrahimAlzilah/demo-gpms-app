import { useTranslation } from 'react-i18next'
import { ModalDialog } from '@/components/common'
import { Button } from '@/components/ui/button'
import { DocumentWorkflowTimeline } from './DocumentWorkflowTimeline'
import { PlusCircle } from 'lucide-react'
import type { Document } from '@/types/request.types'

interface DocumentWorkflowModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadNew: () => void
  documents?: Document[]
  isPhase1Active: boolean
  isPhase2Active: boolean
  isFinalDefense1Active: boolean
  isFinalDefense2Active: boolean
  isFinalActive: boolean
  hasProject: boolean
  hasSupervisor: boolean
  finalDefense1Completed: boolean
  finalDefense2Completed: boolean
  canUpload: boolean
}

export function DocumentWorkflowModal({
  open,
  onOpenChange,
  onUploadNew,
  documents,
  isPhase1Active,
  isPhase2Active,
  isFinalDefense1Active,
  isFinalDefense2Active,
  isFinalActive,
  hasProject,
  hasSupervisor,
  finalDefense1Completed,
  finalDefense2Completed,
  canUpload,
}: DocumentWorkflowModalProps) {
  const { t } = useTranslation()

  const handleNextUpload = () => {
    onOpenChange(false)
    onUploadNew()
  }

  return (
    <ModalDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('document.workflow.title')}
      size="2xl"
      className="max-w-2xl"
    >
      <div className="space-y-6">
        <DocumentWorkflowTimeline
          documents={documents}
          isPhase1Active={isPhase1Active}
          isPhase2Active={isPhase2Active}
          isFinalDefense1Active={isFinalDefense1Active}
          isFinalDefense2Active={isFinalDefense2Active}
          isFinalActive={isFinalActive}
          hasProject={hasProject}
          hasSupervisor={hasSupervisor}
          finalDefense1Completed={finalDefense1Completed}
          finalDefense2Completed={finalDefense2Completed}
          t={t}
        />

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="sm:me-auto"
          >
            {t('common.close')}
          </Button>
          <Button
            type="button"
            onClick={handleNextUpload}
            disabled={!canUpload}
            className="gap-2"
          >
            <PlusCircle className="size-4" />
            {t('document.workflow.nextUploadNew')}
          </Button>
        </div>
      </div>
    </ModalDialog>
  )
}
