import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../layouts/MainLayout'
import { ProposalForm } from '../../features/student/components/ProposalForm'
import { useProposals } from '../../features/student/hooks/useProposals'
import { useAuthStore } from '../../features/auth/store/auth.store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { StatusBadge } from '../../components/common/StatusBadge'
import { StatusFilter, type FilterOption } from '../../components/common/StatusFilter'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { FileText, Plus, Eye, Calendar, User, MessageSquare, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'
import { formatDate, formatRelativeTime } from '../../lib/utils/format'

export function ProposalsPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { data: proposals, isLoading } = useProposals()
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null)

  const userProposals = proposals?.filter((p) => p.submitterId === user?.id) || []

  const statusOptions: FilterOption[] = [
    { value: 'pending_review', label: t('proposal.status.pendingReview') || 'قيد المراجعة' },
    { value: 'approved', label: t('proposal.status.approved') || 'معتمد' },
    { value: 'rejected', label: t('proposal.status.rejected') || 'مرفوض' },
    { value: 'requires_modification', label: t('proposal.status.requiresModification') || 'يتطلب تعديل' },
  ]

  const filteredProposals = statusFilter.length > 0
    ? userProposals.filter((p) => statusFilter.includes(p.status))
    : userProposals

  const selectedProposalData = selectedProposal
    ? userProposals.find((p) => p.id === selectedProposal)
    : null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-5 w-5 text-success" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-destructive" />
      case 'requires_modification':
        return <AlertCircle className="h-5 w-5 text-warning" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              {t('nav.proposals') || 'المقترحات'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t('proposal.pageDescription') || 'قم بتقديم مقترحات مشاريع التخرج أو راجع المقترحات المقدمة'}
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto"
          >
            <Plus className="ml-2 h-4 w-4" />
            {showForm ? (t('common.cancel') || 'إلغاء') : (t('proposal.submitNew') || 'مقترح جديد')}
          </Button>
        </div>

        {/* Proposal Form */}
        {showForm && (
          <ProposalForm
            onSuccess={() => {
              setShowForm(false)
            }}
          />
        )}

        {/* Statistics */}
        {userProposals.length > 0 && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('proposal.total') || 'المجموع'}</p>
                    <p className="text-2xl font-bold">{userProposals.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('proposal.status.pendingReview') || 'قيد المراجعة'}</p>
                    <p className="text-2xl font-bold">
                      {userProposals.filter((p) => p.status === 'pending_review').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-warning" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('proposal.status.approved') || 'معتمد'}</p>
                    <p className="text-2xl font-bold">
                      {userProposals.filter((p) => p.status === 'approved').length}
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('proposal.status.rejected') || 'مرفوض'}</p>
                    <p className="text-2xl font-bold">
                      {userProposals.filter((p) => p.status === 'rejected').length}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        {userProposals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('common.filter') || 'فلترة حسب الحالة'}</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusFilter
                options={statusOptions}
                value={statusFilter}
                onChange={setStatusFilter}
              />
            </CardContent>
          </Card>
        )}

        {/* Proposals List */}
        {filteredProposals.length > 0 ? (
          <div className="space-y-4">
            {filteredProposals.map((proposal) => (
              <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(proposal.status)}
                        <div className="flex-1">
                          <CardTitle className="mb-1">{proposal.title}</CardTitle>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatRelativeTime(proposal.createdAt)}
                            </div>
                            {proposal.reviewedAt && (
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {t('proposal.reviewedAt') || 'تمت المراجعة'} {formatRelativeTime(proposal.reviewedAt)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={proposal.status} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProposal(proposal.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-1">{t('proposal.description') || 'الوصف'}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {proposal.description}
                      </p>
                    </div>
                    {proposal.reviewNotes && (
                      <div className="rounded-lg bg-muted p-3 border border-muted-foreground/20">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <h4 className="text-sm font-medium">{t('proposal.reviewNotes') || 'ملاحظات المراجعة'}</h4>
                        </div>
                        <p className="text-sm">{proposal.reviewNotes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title={userProposals.length === 0 ? (t('proposal.noProposals') || 'لا توجد مقترحات') : (t('common.noResults') || 'لا توجد نتائج')}
            description={
              userProposals.length === 0
                ? (t('proposal.noProposalsDescription') || 'ابدأ بتقديم مقترح مشروع تخرج جديد')
                : (t('proposal.noResultsDescription') || 'جرب تغيير الفلاتر للعثور على مقترحات')
            }
            action={
              userProposals.length === 0
                ? {
                  label: t('proposal.submitNew') || 'تقديم مقترح جديد',
                  onClick: () => setShowForm(true),
                }
                : undefined
            }
          />
        )}

        {/* Proposal Detail Dialog */}
        {selectedProposalData && (
          <Dialog open={!!selectedProposal} onOpenChange={(open) => !open && setSelectedProposal(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getStatusIcon(selectedProposalData.status)}
                  {selectedProposalData.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <StatusBadge status={selectedProposalData.status} />
                  <span className="text-muted-foreground">
                    {t('proposal.submittedAt') || 'تم الإرسال في'} {formatDate(selectedProposalData.createdAt)}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">{t('proposal.description') || 'الوصف'}</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedProposalData.description}
                  </p>
                </div>

                {selectedProposalData.objectives && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t('proposal.objectives') || 'الأهداف'}</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedProposalData.objectives}
                    </p>
                  </div>
                )}

                {selectedProposalData.methodology && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t('proposal.methodology') || 'المنهجية'}</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedProposalData.methodology}
                    </p>
                  </div>
                )}

                {selectedProposalData.expectedOutcomes && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t('proposal.expectedOutcomes') || 'النتائج المتوقعة'}</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedProposalData.expectedOutcomes}
                    </p>
                  </div>
                )}

                {selectedProposalData.reviewNotes && (
                  <div className="rounded-lg bg-muted p-4 border border-muted-foreground/20">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <h4 className="text-sm font-medium">{t('proposal.reviewNotes') || 'ملاحظات المراجعة'}</h4>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{selectedProposalData.reviewNotes}</p>
                    {selectedProposalData.reviewedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {t('proposal.reviewedAt') || 'تمت المراجعة في'} {formatDate(selectedProposalData.reviewedAt)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  )
}
