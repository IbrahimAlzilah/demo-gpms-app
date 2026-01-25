import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BlockContent, LoadingSpinner } from '@/components/common'
import { Button } from '@/components/ui'
import {
  ArrowLeft,
  PlusCircle,
  Trash2,
  Send,
  Loader2,
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { useProposalsSubmit } from './ProposalsSubmit.hook'
import { ProposalFields } from '../components/ProposalFields'
import { cn } from '@/lib/utils'

export function ProposalsSubmit() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    proposals,
    addProposal,
    removeProposal,
    updateProposal,
    handleSubmit,
    isSubmitting,
    isPeriodActive,
  } = useProposalsSubmit(() => {
    navigate(ROUTES.SUPERVISOR.MY_PROPOSALS)
  })

  if (!isPeriodActive) {
    return (
      <div className="space-y-6">
        <BlockContent title={t('proposal.submitNew')}>
          <div className="flex items-center gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="p-2 rounded-full bg-warning/20">
              <Loader2 className="h-5 w-5 text-warning animate-spin" />
            </div>
            <div>
              <p className="text-sm font-medium text-warning">
                {t('proposal.periodClosed')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('proposal.periodClosedDescription')}
              </p>
            </div>
          </div>
        </BlockContent>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <BlockContent
        title={t('proposal.submitNew')}
        actions={
          <Button variant="outline" onClick={() => navigate(ROUTES.SUPERVISOR.MY_PROPOSALS)}>
            <ArrowLeft className="h-4 w-4 me-2" />
            {t('common.back')}
          </Button>
        }
      >
        <div className="space-y-6">
          {proposals.map((proposal, index) => (
            <div
              key={proposal.id}
              className={cn(
                'p-6 rounded-lg border',
                'bg-card border-border',
                'transition-all duration-200',
                proposal.errors && Object.keys(proposal.errors).length > 0 && 'border-destructive/50'
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {t('proposal.proposal')} {index + 1}
                </h3>
                {proposals.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProposal(proposal.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 me-2" />
                    {t('common.remove')}
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

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={addProposal}
              disabled={isSubmitting}
            >
              <PlusCircle className="h-4 w-4 me-2" />
              {t('proposal.addAnother')}
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  {t('common.submitting')}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 me-2" />
                  {t('proposal.submit')}
                </>
              )}
            </Button>
          </div>
        </div>
      </BlockContent>
    </div>
  )
}
