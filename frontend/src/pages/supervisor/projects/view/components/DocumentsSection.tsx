import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, Button, Label, Textarea } from '@/components/ui'
import { LoadingSpinner, StatusBadge, ModalDialog, useToast } from '@/components/common'
import { FileText, Download, CheckCircle, XCircle, MessageSquare } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'
import { supervisorDocumentService } from '../../api/document.service'
import type { Document } from '@/types/request.types'
import { useParams } from 'react-router-dom'

interface DocumentsSectionProps {
  documents?: Document[]
  isLoading?: boolean
  projectId?: string
}

export function DocumentsSection({ documents, isLoading, projectId }: DocumentsSectionProps) {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const actualProjectId = projectId || id || ''
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [reviewState, setReviewState] = useState<{
    document: Document | null
    status: 'approved' | 'rejected' | null
    comments: string
    showDialog: boolean
  }>({
    document: null,
    status: null,
    comments: '',
    showDialog: false,
  })

  const reviewMutation = useMutation({
    mutationFn: async ({
      documentId,
      status,
      comments,
    }: {
      documentId: string
      status: 'approved' | 'rejected'
      comments?: string
    }) => {
      return supervisorDocumentService.review(actualProjectId, documentId, status, comments)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supervisor-project', actualProjectId] })
      setReviewState({ document: null, status: null, comments: '', showDialog: false })
      showToast({
        title: t('common.success'),
        description: t('supervisor.documentReviewed'),
        variant: 'default',
      })
    },
    onError: () => {
      showToast({
        title: t('common.error'),
        description: t('supervisor.failedToReviewDocument'),
        variant: 'destructive',
      })
    },
  })

  const handleDownload = async (document: Document) => {
    try {
      await supervisorDocumentService.download(actualProjectId, document.id, document.fileName || document.id)
    } catch (err) {
      console.error('Failed to download document:', err)
      showToast({
        title: t('common.error'),
        description: t('supervisor.failedToDownloadDocument'),
        variant: 'destructive',
      })
    }
  }

  const handleReview = (document: Document, status: 'approved' | 'rejected') => {
    setReviewState({
      document,
      status,
      comments: document.reviewComments || '',
      showDialog: true,
    })
  }

  const submitReview = () => {
    if (!reviewState.document || !reviewState.status) return
    reviewMutation.mutate({
      documentId: reviewState.document.id,
      status: reviewState.status,
      comments: reviewState.comments || undefined,
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (!documents || documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {t('supervisor.projectDocuments')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            {t('supervisor.noDocuments')}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          {t('supervisor.projectDocuments')} ({documents.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documents.map((document) => (
            <div
              key={document.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {document.fileName || t('supervisor.unnamedDocument')}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="capitalize">{document.type}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(document.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {document.reviewStatus && (
                  <StatusBadge status={`reviewStatus_${document.reviewStatus}`} />
                )}
                {document.reviewStatus === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReview(document, 'approved')}
                      className="text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {t('supervisor.approve')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReview(document, 'rejected')}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      {t('supervisor.reject')}
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(document)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  {t('common.download')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Review Dialog */}
      <ModalDialog
        open={reviewState.showDialog}
        onOpenChange={(open) =>
          setReviewState((prev) => ({ ...prev, showDialog: open }))
        }
        title={
          reviewState.status === 'approved'
            ? t('supervisor.approveDocument')
            : t('supervisor.rejectDocument')
        }
      >
        <div className="space-y-4">
          {reviewState.document && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t('supervisor.document')}: {reviewState.document.fileName}
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="review-comments">
              {t('supervisor.reviewComments')} ({t('common.optional')})
            </Label>
            <Textarea
              id="review-comments"
              value={reviewState.comments}
              onChange={(e) =>
                setReviewState((prev) => ({ ...prev, comments: e.target.value }))
              }
              placeholder={t('supervisor.reviewCommentsPlaceholder')}
              rows={4}
              className="resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() =>
                setReviewState({
                  document: null,
                  status: null,
                  comments: '',
                  showDialog: false,
                })
              }
              disabled={reviewMutation.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={submitReview}
              disabled={reviewMutation.isPending}
              variant={reviewState.status === 'approved' ? 'default' : 'destructive'}
            >
              {reviewMutation.isPending
                ? t('common.saving')
                : reviewState.status === 'approved'
                  ? t('supervisor.approve')
                  : t('supervisor.reject')}
            </Button>
          </div>
        </div>
      </ModalDialog>
    </Card>
  )
}
