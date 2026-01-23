import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BlockContent, LoadingSpinner, ModalDialog } from '@/components/common'
import { Button } from '@/components/ui'
import { ArrowLeft, Plus, Trash2, AlertCircle } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { useMyGroup } from '@/pages/student/groups/hooks/useGroups'
import { useAuthStore } from '@/pages/auth/login'
import { useProposalsSubmit } from './ProposalsSubmit.hook'
import { ProposalFields } from '../components/ProposalFields/ProposalFields'

export function ProposalsSubmit() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: studentGroup, isLoading: groupLoading } = useMyGroup()
  const [showLockModal, setShowLockModal] = useState(false)
  
  const {
    proposals,
    addProposal,
    removeProposal,
    updateProposal,
    handleSubmit,
    isSubmitting,
    isLocked,
    isLoadingLock,
  } = useProposalsSubmit(() => {
    navigate(ROUTES.STUDENT.MY_PROPOSALS)
  })

  // ENFORCE: Only group leaders can submit (block solo students and non-leaders)
  const isLeader = studentGroup ? studentGroup.leaderId === user?.id : false
  const canSubmit = studentGroup && isLeader

  useEffect(() => {
    if (!groupLoading && !canSubmit) {
      // Non-leader group member or solo student - redirect to list
      navigate(ROUTES.STUDENT.MY_PROPOSALS)
    }
  }, [groupLoading, canSubmit, navigate])

  // Check lock status when component mounts
  useEffect(() => {
    if (studentGroup && isLeader) {
      if (isLocked) {
        setShowLockModal(true)
      }
    }
  }, [studentGroup, isLeader, isLocked])

  if (groupLoading) {
    return <LoadingSpinner />
  }

  if (!canSubmit) {
    return null // Will redirect
  }

  const handleSubmitClick = async () => {
    if (isLocked) {
      setShowLockModal(true)
      return
    }

    if (proposals.length === 0) {
      return
    }

    await handleSubmit()
  }

  return (
    <>
      <BlockContent
        title={t('proposal.submitNew')}
        actions={
          <Button variant="outline" onClick={() => navigate(ROUTES.STUDENT.MY_PROPOSALS)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
        }
      >
        <div className="space-y-6">
          {isLocked && (
            <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-warning-foreground">
                  {t('proposal.submissionLocked')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('proposal.submissionLockedDescription')}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {proposals.map((proposal, index) => (
              <div key={proposal.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {t('proposal.proposal')} {index + 1}
                  </h3>
                  {proposals.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProposal(proposal.id)}
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
              onClick={() => addProposal()}
              disabled={isSubmitting || isLocked}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('proposal.addAnother')}
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
              onClick={handleSubmitClick}
              disabled={isSubmitting || proposals.length === 0 || isLocked}
            >
              {isSubmitting ? t('proposal.submitting') : t('proposal.submit')}
            </Button>
          </div>
        </div>
      </BlockContent>

      {/* Lock Modal */}
      <ModalDialog
        open={showLockModal}
        onOpenChange={setShowLockModal}
        title={t('proposal.submissionNotAllowed')}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('proposal.submissionLockedMessage')}
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowLockModal(false)
                navigate(ROUTES.STUDENT.MY_PROPOSALS)
              }}
            >
              {t('common.close')}
            </Button>
          </div>
        </div>
      </ModalDialog>
    </>
  )
}
