import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { MainLayout } from '@/layouts/MainLayout'
import { BlockContent, ModalDialog } from '@/components/common'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { ROUTES } from '@/lib/constants/constants'
import { discussionCommitteeProjectService } from '../api/project.service'
import { UnifiedEvaluationModal } from '../../evaluation/components/UnifiedEvaluationModal'
import { useState } from 'react'
import {
  ChevronLeft,
  FileText,
  Users,
  User,
  ClipboardCheck,
  Download,
  Loader2,
  Award,
} from 'lucide-react'
import { formatDate } from '@/lib/utils/format'

export function ProjectDetailScreen() {
  const { projectId } = useParams<{ projectId: string }>()
  const { t } = useTranslation()
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [showEvaluateModal, setShowEvaluateModal] = useState(false)

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['discussion-committee-project', projectId],
    queryFn: () => discussionCommitteeProjectService.getById(projectId!),
    enabled: !!projectId,
    staleTime: 0,
  })

  if (!projectId) {
    return (
      <MainLayout>
        <BlockContent title={t('common.error')}>
          <p className="text-muted-foreground">{t('project.projectNotFound')}</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to={ROUTES.DISCUSSION_COMMITTEE.PROJECTS}>{t('common.back')}</Link>
          </Button>
        </BlockContent>
      </MainLayout>
    )
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner />
        </div>
      </MainLayout>
    )
  }

  if (error || !project) {
    return (
      <MainLayout>
        <BlockContent title={t('common.error')}>
          <p className="text-muted-foreground">
            {(error as Error)?.message || t('project.projectNotFound')}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to={ROUTES.DISCUSSION_COMMITTEE.PROJECTS}>{t('common.back')}</Link>
          </Button>
        </BlockContent>
      </MainLayout>
    )
  }

  const documents = (project as { documents?: Array<{ id: string; fileName?: string; file_name?: string; chapter_number?: number; chapterNumber?: number; type?: string; review_status?: string; reviewStatus?: string }> }).documents ?? []
  const docsApproved = documents.filter((d: { review_status?: string; reviewStatus?: string }) => (d.review_status ?? d.reviewStatus) === 'approved').length
  const gradesCount = (project as { grades?: unknown[] }).grades?.length ?? 0
  const studentsCount = project.students?.length ?? 0

  const handleDownload = async (doc: { id: string; file_name?: string; fileName?: string }) => {
    if (!projectId) return
    setDownloadingId(doc.id)
    try {
      await discussionCommitteeProjectService.downloadDocument(
        projectId,
        doc.id,
        doc.file_name ?? doc.fileName ?? undefined
      )
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in duration-300 pb-10">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Button variant="ghost" size="sm" asChild className="gap-1 -ms-2">
            <Link to={ROUTES.DISCUSSION_COMMITTEE.PROJECTS}>
              <ChevronLeft className="h-4 w-4" />
              {t('nav.projects')}
            </Link>
          </Button>
          <span>/</span>
          <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-none">
            {project.title}
          </span>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">{project.title}</CardTitle>
            {project.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">
                {project.description}
              </p>
            )}
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-sm">{t('discussion.workflowStatus')}</CardTitle>
            {studentsCount > 0 && (
              <Button
                size="sm"
                className="gap-1"
                onClick={() => setShowEvaluateModal(true)}
              >
                <Award className="h-4 w-4" />
                {t('discussion.evaluateProject')}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                {t('discussion.documentsPhase')}: {docsApproved}/{documents.length}
              </span>
              <span className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                {t('discussion.evaluationPhase')}: {gradesCount}/{studentsCount} {t('discussion.evaluated')}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('project.supervisor')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.supervisor ? (
                <div className="text-sm">
                  <p className="font-medium">{project.supervisor.name}</p>
                  {project.supervisor.email && (
                    <p className="text-muted-foreground text-xs">{project.supervisor.email}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t('common.unassigned')}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('common.students')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.students?.length ? (
                <ul className="text-sm space-y-1">
                  {project.students.map((s: { id: string; name?: string; email?: string }) => (
                    <li key={s.id}>
                      <span className="font-medium">{s.name}</span>
                      {s.email && (
                        <span className="text-muted-foreground text-xs ml-1">({s.email})</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">—</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {t('discussion.projectDocuments')} ({t('common.readOnly')})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('discussion.noDocuments')}</p>
            ) : (
              <ul className="space-y-2">
                {documents.map((doc: { id: string; file_name?: string; fileName?: string; chapter_number?: number; chapterNumber?: number; type?: string; review_status?: string; reviewStatus?: string }) => {
                  const status = doc.review_status ?? doc.reviewStatus
                  const chapterNum = doc.chapter_number ?? doc.chapterNumber
                  const fileName = doc.file_name ?? doc.fileName ?? doc.id
                  return (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg border bg-muted/30"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium truncate">
                          {doc.type === 'chapters' && chapterNum != null
                            ? `${t('document.chapter')} ${chapterNum}: `
                            : ''}
                          {fileName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary" className="text-xs">
                          {status === 'approved'
                            ? t('common.approved')
                            : status === 'pending'
                              ? t('common.pending')
                              : status ?? '—'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDownload(doc)}
                          disabled={downloadingId === doc.id}
                          title={t('discussion.downloadDocument')}
                        >
                          {downloadingId === doc.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {showEvaluateModal && projectId && (
          <ModalDialog
            open={showEvaluateModal}
            onOpenChange={setShowEvaluateModal}
            title={t('evaluation.evaluate')}
            // size="xl"
            className="lg:max-w-3xl"
          >
            <UnifiedEvaluationModal
              open={showEvaluateModal}
              onOpenChange={setShowEvaluateModal}
              projectId={projectId}
              role="discussion_committee"
              onSuccess={() => setShowEvaluateModal(false)}
            />
          </ModalDialog>
        )}
      </div>
    </MainLayout>
  )
}
