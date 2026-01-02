import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSupervisorProposals, useSupervisorProposal } from '../hooks/useProposals'
import { useUpdateSupervisorProposal } from '../hooks/useProposals'
import { ProposalForm } from './ProposalForm'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { LoadingSpinner, StatusBadge } from '@/components/common'
import { Plus, Edit, FileText } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'

export function ProposalManagement() {
  const { t } = useTranslation()
  const { data: proposals, isLoading } = useSupervisorProposals()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('supervisor.proposalManagement')}</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('supervisor.createProposal')}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{t('supervisor.createNewProposal')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProposalForm
              onSuccess={() => {
                setShowForm(false)
              }}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {proposals && proposals.length > 0 ? (
          proposals.map((proposal) => (
            <Card key={proposal.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      {proposal.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatRelativeTime(proposal.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={proposal.status} />
                    {editingId !== proposal.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingId(proposal.id)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        {t('common.edit')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingId === proposal.id ? (
                  <ProposalForm
                    proposalId={proposal.id}
                    initialData={proposal}
                    onSuccess={() => setEditingId(null)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm">{proposal.description}</p>
                    {proposal.objectives && (
                      <div>
                        <h4 className="font-medium text-sm mb-1">{t('proposal.objectives')}</h4>
                        <p className="text-sm text-muted-foreground">{proposal.objectives}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {t('supervisor.noProposals')}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
