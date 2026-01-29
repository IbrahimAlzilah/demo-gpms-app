import { CheckCircle2, Clock, XCircle, Lock, FileText, AlertCircle, MessageSquare, Download, Upload } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/common/StatusBadge'
import { documentService } from '../api/document.service'
import type { Document } from '@/types/request.types'

interface ChapterStatusCardsProps {
  documents?: Document[]
  isPhase1Active: boolean
  isPhase2Active: boolean
  finalDefense1Completed: boolean
  onChapterClick?: (chapterNumber: number) => void
  onViewDocument?: (document: Document) => void
  t: (key: string, options?: Record<string, unknown>) => string
}

type ChapterStatus = 'not_started' | 'pending' | 'approved' | 'rejected'

interface ChapterInfo {
  number: number
  phase: 1 | 2
  status: ChapterStatus
  document?: Document
  canSubmit: boolean
  reason?: string
}

export function ChapterStatusCards({
  documents = [],
  isPhase1Active,
  isPhase2Active,
  finalDefense1Completed,
  onChapterClick,
  onViewDocument,
  t,
}: ChapterStatusCardsProps) {
  const chapterDocs = documents.filter(
    (doc) => doc.type === 'chapters' && typeof doc.chapterNumber === 'number'
  )

  const getChapterInfo = (chapterNum: number): ChapterInfo => {
    const chapterDoc = chapterDocs.find((doc) => doc.chapterNumber === chapterNum)
    const phase: 1 | 2 = chapterNum <= 3 ? 1 : 2
    const phaseActive = phase === 1 ? isPhase1Active : isPhase2Active

    let status: ChapterStatus = 'not_started'
    if (chapterDoc) {
      if (chapterDoc.reviewStatus === 'approved') status = 'approved'
      else if (chapterDoc.reviewStatus === 'rejected') status = 'rejected'
      else status = 'pending'
    }

    // Determine if chapter can be submitted
    let canSubmit = false
    let reason: string | undefined

    if (chapterNum === 1) {
      canSubmit = phaseActive && phase === 1
      if (!phaseActive) reason = t('document.chapters.phaseNotActive')
    } else if (chapterNum === 4) {
      canSubmit = phaseActive && phase === 2 && finalDefense1Completed
      if (!finalDefense1Completed) reason = t('document.chapters.defense1NotCompleted')
      else if (!phaseActive) reason = t('document.chapters.phaseNotActive')
    } else {
      // Chapters 2, 3, 5, 6
      const prevChapter = chapterNum - 1
      const prevDoc = chapterDocs.find((doc) => doc.chapterNumber === prevChapter)
      const prevApproved = prevDoc?.reviewStatus === 'approved'

      canSubmit = phaseActive && prevApproved && status !== 'pending'
      if (!prevApproved) {
        reason = t('document.chapters.prevChapterNotApproved', { chapter: prevChapter })
      } else if (!phaseActive) {
        reason = t('document.chapters.phaseNotActive')
      } else if (status === 'pending') {
        reason = t('document.chapters.pendingReview')
      }
    }

    return {
      number: chapterNum,
      phase,
      status,
      document: chapterDoc,
      canSubmit,
      reason,
    }
  }

  const chapters: ChapterInfo[] = [1, 2, 3, 4, 5, 6].map(getChapterInfo)

  const getStatusIcon = (status: ChapterStatus) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-5 w-5 text-success" />
      case 'pending':
        return <Clock className="h-5 w-5 text-warning animate-pulse" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-destructive" />
      case 'not_started':
        return <Lock className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusColor = (chapter: ChapterInfo) => {
    if (chapter.status === 'approved') {
      return 'border-success/50 1bg-success/5'
    }
    if (chapter.status === 'pending') {
      return 'border-warning/50 1bg-warning/5'
    }
    if (chapter.status === 'rejected') {
      return 'border-destructive/50 1bg-destructive/5'
    }
    if (chapter.canSubmit) {
      return 'border-primary/50 bg-primary/5 ring-2 ring-primary/20'
    }
    return 'border-muted/80 bg-muted/50'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('document.chapters.title')}</h3>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span>{t('document.chapters.phase1')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span>{t('document.chapters.phase2')}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {chapters.map((chapter) => (
          <Card
            key={chapter.number}
            className={cn(
              'transition-all hover:shadow-sm',
              getStatusColor(chapter),
              chapter.canSubmit && !chapter.document && 'cursor-pointer hover:scale-[1.02]',
              !chapter.canSubmit && !chapter.document && 'cursor-not-allowed'
            )}
            onClick={() => chapter.canSubmit && !chapter.document && onChapterClick?.(chapter.number)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">
                    {t('document.chapters.chapter')} {chapter.number}
                  </h4>
                </div>
                {getStatusIcon(chapter.status)}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={
                      chapter.status === 'approved'
                        ? 'reviewStatus_approved'
                        : chapter.status === 'pending'
                          ? 'reviewStatus_pending'
                          : chapter.status === 'rejected'
                            ? 'reviewStatus_rejected'
                            : 'pending'
                    }
                  />
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      chapter.phase === 1
                        ? 'bg-primary/10 text-primary'
                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    )}
                  >
                    {chapter.phase === 1
                      ? t('document.chapters.phase1')
                      : t('document.chapters.phase2')}
                  </span>
                </div>

                {chapter.document && (
                  <div className="text-xs text-muted-foreground">
                    <p className="truncate">{chapter.document.fileName}</p>
                    {chapter.document.reviewComments && (
                      <p className="mt-1 line-clamp-2 italic">
                        {chapter.document.reviewComments}
                      </p>
                    )}
                  </div>
                )}

                {chapter.reason && (
                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground mt-2">
                    <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>{chapter.reason}</span>
                  </div>
                )}

                {chapter.canSubmit && !chapter.document && (
                  <div className="text-xs text-primary font-medium mt-2">
                    {t('document.chapters.readyToSubmit')}
                  </div>
                )}

                {/* Action buttons: View & Download when document exists; Upload when can submit and no document */}
                <div className="flex items-center gap-2 pt-3 mt-2 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
                  {chapter.document ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                        onClick={() => onViewDocument?.(chapter.document!)}
                        title={t('common.view')}
                        aria-label={t('common.view')}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only">{t('common.view')}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                        onClick={async () => {
                          try {
                            await documentService.download(chapter.document!.id, chapter.document!.fileName)
                          } catch (err) {
                            console.error('Download failed:', err)
                          }
                        }}
                        title={t('document.download')}
                        aria-label={t('document.download')}
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only">{t('document.download')}</span>
                      </Button>
                    </>
                  ) : chapter.canSubmit ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        onChapterClick?.(chapter.number)
                      }}
                      title={t('document.uploadNew')}
                      aria-label={t('document.uploadNew')}
                    >
                      <Upload className="h-4 w-4" />
                      <span>{t('document.uploadNew')}</span>
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
