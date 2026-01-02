import { ModalDialog } from '@/components/common'
import { ProposalForm } from '../components/ProposalForm'
import { useProposalsNew } from './ProposalsNew.hook'
import { useTranslation } from 'react-i18next'

interface ProposalsNewProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ProposalsNew({ open, onClose, onSuccess }: ProposalsNewProps) {
  const { t } = useTranslation()
  const { form, isSubmitting } = useProposalsNew(() => {
    form.resetForm()
    onSuccess?.()
    onClose()
  })

  return (
    <ModalDialog open={open} onOpenChange={onClose} title={t('proposal.submitNew')}>
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
        onCancel={onClose}
      />
    </ModalDialog>
  )
}
