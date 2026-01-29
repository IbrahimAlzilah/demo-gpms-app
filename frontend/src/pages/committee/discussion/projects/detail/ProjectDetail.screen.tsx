import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { MainLayout } from '@/layouts/MainLayout'
import { BlockContent } from '@/components/common'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { ROUTES } from '@/lib/constants'
import { discussionCommitteeProjectService } from '../api/project.service'
import {
  ChevronLeft,
  FileText,
  Users,
  User,
} from 'lucide-react'
import { formatDate } from '@/lib/utils/format'

export function ProjectDetailScreen() {
  const { projectId } = useParams<{ projectId: string }>()
  const { t } = useTranslation()

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

  const documents = (project as { documents?: Array<{ id: string; file_name?: string; chapter_number?: number; type?: string; review_status?: string }> }).documents ?? []

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
                {documents.map((doc: { id: string; file_name?: string; chapter_number?: number; type?: string; review_status?: string }) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {doc.type === 'chapters' && doc.chapter_number != null
                          ? `${t('document.chapter')} ${doc.chapter_number}: `
                          : ''}
                        {doc.file_name ?? doc.id}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {doc.review_status === 'approved'
                        ? t('common.approved')
                        : doc.review_status === 'pending'
                          ? t('common.pending')
                          : doc.review_status ?? '—'}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
