import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MainLayout } from '@/layouts/MainLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@/components/ui'
import { LoadingSpinner, StatusBadge, BlockContent } from '@/components/common'
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  User,
  Users,
  Building2,
  Calendar,
  Tag
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { useProjectDetails } from './ProjectDetails.hook'
import { formatDate } from '@/lib/utils/format'
import { DocumentsSection } from './components/DocumentsSection'
import { FinalGradesSection } from './components/FinalGradesSection'
import type { Project } from '@/types/project.types'
import type { Document } from '@/types/request.types'
import type { Grade } from '@/types/evaluation.types'

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { project, isLoading, error } = useProjectDetails(id || '')

  if (!id) {
    return (
      <MainLayout>
        <BlockContent title={t('supervisor.projectIdRequired')}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                {t('supervisor.projectIdRequired')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {t('supervisor.projectIdRequiredMessage')}
              </p>
              <Button
                onClick={() => navigate(ROUTES.SUPERVISOR.PROJECTS)}
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('supervisor.backToProjects')}
              </Button>
            </CardContent>
          </Card>
        </BlockContent>
      </MainLayout>
    )
  }

  if (isLoading) {
    return (
      <MainLayout>
        <BlockContent title={t('project.projectDetails')}>
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        </BlockContent>
      </MainLayout>
    )
  }

  if (error || !project) {
    return (
      <MainLayout>
        <BlockContent title={t('project.projectDetails')}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                {t('common.error')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {error?.message || t('project.loadError') || 'حدث خطأ أثناء تحميل تفاصيل المشروع'}
              </p>
              <Button
                onClick={() => navigate(ROUTES.SUPERVISOR.PROJECTS)}
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('supervisor.backToProjects')}
              </Button>
            </CardContent>
          </Card>
        </BlockContent>
      </MainLayout>
    )
  }

  const actions = (
    <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.SUPERVISOR.PROJECTS)}>
      <ArrowLeft className="h-4 w-4 mr-2" />
      {t('supervisor.backToProjects')}
    </Button>
  )

  return (
    <MainLayout>
      <BlockContent title={t('project.projectDetails')} actions={actions}>
        <div className="space-y-4">
          {/* Project Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-6 w-6 text-primary" />
                    {project.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {project.description}
                  </CardDescription>
                </div>
                <StatusBadge status={project.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Full Description */}
              <div>
                <h4 className="text-sm font-medium mb-2">{t('project.description')}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {project.description}
                </p>
              </div>

              {/* Project Metadata Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t('project.supervisor')}</p>
                    <p className="text-sm font-medium">
                      {project.supervisor?.name || t('project.noSupervisor')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t('project.students')}</p>
                    <p className="text-sm font-medium">
                      {project.currentStudents}/{project.maxStudents}
                    </p>
                  </div>
                </div>
                {project.specialization && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t('project.specialization')}</p>
                      <p className="text-sm font-medium">{project.specialization}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t('common.date')}</p>
                    <p className="text-sm font-medium">
                      {project.createdAt ? formatDate(project.createdAt) : t('common.notSet')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Keywords */}
              {project.keywords && project.keywords.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    {t('project.keywords')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Students List */}
          {project.students && project.students.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {t('project.students')} ({project.students.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {project.students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{student.name}</p>
                          {student.email && (
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents Section */}
          <DocumentsSection
            documents={(project as Project & { documents?: Document[] }).documents}
            isLoading={isLoading}
            projectId={id}
          />

          {/* Final Grades Section */}
          <FinalGradesSection
            grades={(project as Project & { grades?: Grade[] }).grades}
            isLoading={isLoading}
          />
        </div>
      </BlockContent>
    </MainLayout>
  )
}
