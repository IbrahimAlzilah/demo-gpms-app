import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BlockContent, LoadingSpinner } from '@/components/common'
import { Button } from '@/components/ui'
import { ArrowLeft, PlusCircle, Trash2, AlertCircle } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { useMyGroup } from '@/pages/student/groups/hooks/useGroups'
import { useAuthStore } from '@/pages/auth/login'
import { useProposalsEditBatch } from './ProposalsEditPage.hook'
import { ProposalFields } from '../components/ProposalFields/ProposalFields'

export function ProposalsEdit() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: studentGroup, isLoading: groupLoading } = useMyGroup()

  const {
    existingProposals,
    newProposals,
    addNewProposal,
    removeNewProposal,
    updateProposal,
    handleSubmit,
    isLoading,
    isSubmitting,
    editBlocked,
    blockReason,
  } = useProposalsEditBatch(() => {
    navigate(ROUTES.STUDENT.MY_PROPOSALS)
  })

  // ENFORCE: Only group leaders can edit (block solo students and non-leaders)
  const isLeader = studentGroup ? studentGroup.leaderId === user?.id : false
  const canEdit = studentGroup && isLeader

  useEffect(() => {
    if (!groupLoading && !canEdit) {
      // Non-leader group member or solo student - redirect to list
      navigate(ROUTES.STUDENT.MY_PROPOSALS)
    }
  }, [groupLoading, canEdit, navigate])

  if (groupLoading || isLoading) {
    return <LoadingSpinner />
  }

  if (!canEdit) {
    return null // Will redirect
  }

  // Check if editing is blocked (either no proposals loaded or explicitly blocked)
  if (editBlocked || (!isLoading && existingProposals.length === 0 && newProposals.length === 0)) {
    return (
      <BlockContent
        title={t('proposal.edit')}
        variant="container"
      >
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t('proposal.cannotEditTitle') || 'Editing Not Allowed'}
          </h3>
          <p className="text-muted-foreground max-w-md mb-2">
            {blockReason || t('proposal.cannotEditApproved') || 'Editing is not allowed at this time.'}
          </p>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            {t('proposal.editBlockedDescription') ||
              'You can only edit proposals when all proposals in your group are in pending review status and no proposal has been approved.'}
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => navigate(ROUTES.STUDENT.MY_PROPOSALS)}
          >
            <ArrowLeft className="size-4 ltr:rotate-180" />
            {t('common.back')}
          </Button>
        </div>
      </BlockContent>
    )
  }

  const allProposals = [...existingProposals, ...newProposals]

  return (
    <BlockContent
      title={t('proposal.edit')}
      actions={
        <Button variant="outline" onClick={() => navigate(ROUTES.STUDENT.MY_PROPOSALS)}>
          <ArrowLeft className="size-4 ltr:rotate-180" />
          {t('common.back')}
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="space-y-4">
          {allProposals.map((proposal, index) => (
            <div key={proposal.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {proposal.isNew ? t('proposal.newProposal') : `${t('proposal.proposal')} ${index + 1}`}
                </h3>
                {proposal.isNew && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeNewProposal(proposal.id)}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <ProposalFields
                proposal={proposal}
                onChange={(data) => updateProposal(proposal.id, data)}
                errors={proposal.errors}
                disabled={isSubmitting}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => addNewProposal()}
            disabled={isSubmitting}
          >
            <PlusCircle className="size-4" />
            {t('proposal.addNewProposal')}
          </Button>
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.STUDENT.MY_PROPOSALS)}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || allProposals.length === 0}
          >
            {isSubmitting ? t('proposal.updating') : t('proposal.update')}
          </Button>
        </div>
      </div>
    </BlockContent>
  )
}
