import { ModalDialog, LoadingSpinner } from '@/components/common'
import { ProposalForm } from '../components/ProposalForm'
import { useProposalsEdit } from './ProposalsEdit.hook'
import { useTranslation } from 'react-i18next'

interface ProposalsEditProps {
  proposalId: string
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ProposalsEdit({
  proposalId,
  open,
  onClose,
  onSuccess,
}: ProposalsEditProps) {
  const { t } = useTranslation()
  const { form, proposal, isLoading, isSubmitting } = useProposalsEdit(proposalId, () => {
    onSuccess?.()
    onClose()
  })

  // Validate proposal status before showing edit form
  if (proposal && proposal.status !== 'pending_review') {
    return (
      <ModalDialog open={open} onOpenChange={onClose} title={t('proposal.edit')}>
        <div className="p-4 text-center text-muted-foreground">
          <p>{t('proposal.cannotEdit')}</p>
        </div>
      </ModalDialog>
    )
  }

  return (
    <ModalDialog open={open} onOpenChange={onClose} title={t('proposal.edit')}>
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner />
        </div>
      ) : (
        <ProposalForm
          form={form.form}
          attachedFiles={form.attachedFiles}
          error={form.error}
          isPeriodActive={form.isPeriodActive}
          periodLoading={form.periodLoading}
          handleSubmit={form.handleSubmit}
          handleFileChange={form.handleFileChange}
          watch={form.watch}
          isSubmitting={isSubmitting}
          isEditMode={true}
          onCancel={onClose}
        />
      )}
    </ModalDialog>
  )
}
