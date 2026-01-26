import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MainLayout } from '@/layouts/MainLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import { LoadingSpinner, StatusBadge, BlockContent, ModalDialog } from '@/components/common'
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  User,
  Users,
  Building2,
  Calendar,
  Tag,
  Eye,
  TrendingUp,
  ClipboardCheck
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { useProjectDetails } from './ProjectDetails.hook'
import { formatDate } from '@/lib/utils/format'
import { DocumentsSection } from './components/DocumentsSection'
import { FinalGradesSection } from './components/FinalGradesSection'
import { ProgressList } from '../../progress/list/ProgressList.screen'
import { EvaluationForm } from '../../evaluation/components/EvaluationForm/EvaluationForm'
import type { Project } from '@/types/project.types'
import type { Document } from '@/types/request.types'
import type { Grade } from '@/types/evaluation.types'

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { project, isLoading, error } = useProjectDetails(id || '')

  // Get active tab from URL params, default to 'view'
  const activeTab = searchParams.get('tab') || 'view'
  const urlStudentId = searchParams.get('studentId') || null

  const [evaluationModal, setEvaluationModal] = useState<{
    open: boolean
    studentId: string | null
  }>({
    open: false,
    studentId: null
  })

  // Handle deep linking for evaluation
  useEffect(() => {
    if (activeTab === 'evaluate' && urlStudentId && !evaluationModal.open) {
      setEvaluationModal({
        open: true,
        studentId: urlStudentId
      })
    }
  }, [activeTab, urlStudentId])

  const handleCloseEvaluationModal = () => {
    setEvaluationModal({ open: false, studentId: null })
    // Optionally clean up URL
    const params = new URLSearchParams(searchParams)
    params.delete('studentId')
    setSearchParams(params)
  }

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
                <ArrowLeft className="size-4 ltr:rotate-180" />
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
                <ArrowLeft className="size-4 ltr:rotate-180" />
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
      <ArrowLeft className="size-4 ltr:rotate-180" />
      {t('common.back')}
    </Button>
  )

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value === 'view') {
      params.delete('tab')
      params.delete('studentId')
    } else {
      params.set('tab', value)
      // When switching tabs manually, we don't automatically select a student unless logic requires it
      params.delete('studentId')
    }
    setSearchParams(params)
  }

  return (
    <MainLayout>
      <BlockContent title={t('project.projectDetails')} actions={actions}>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="view" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {t('common.view')}
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('nav.progress')}
            </TabsTrigger>
            <TabsTrigger value="evaluate" className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              {t('nav.evaluation')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="mt-6">
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
                        <p className="text-xs text-muted-foreground">{t('project.groups')}</p>
                        <p className="text-sm font-medium">
                          {project.currentGroups ?? 0}/{project.maxGroups ?? 1}
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

              {/* Groups List */}
              {project.groups && project.groups.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      {t('project.groups')} ({project.groups.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {project.groups.map((group) => (
                        <div key={group.id} className="p-4 border rounded-lg">
                          <div className="mb-3">
                            <h4 className="font-medium text-sm mb-1">
                              {group.name || group.groupCode || t('project.group')}
                            </h4>
                            {group.groupCode && (
                              <p className="text-xs text-muted-foreground">{group.groupCode}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              {t('groups.members')} ({group.memberCount}/{group.maxMembers})
                            </p>
                            {group.members && group.members.length > 0 && (
                              <div className="space-y-2">
                                {group.members.map((member) => (
                                  <div
                                    key={member.id}
                                    className="flex items-center gap-3 p-2 bg-muted rounded"
                                  >
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                                      {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">{member.name}</p>
                                      {member.id === group.leaderId && (
                                        <p className="text-xs text-primary">{t('groups.leader')}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
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
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            {id && <ProgressList projectId={id} />}
          </TabsContent>

          <TabsContent value="evaluate" className="mt-6">
            {id && project?.students && project.students.length > 0 ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('nav.evaluation')}</CardTitle>
                    <CardDescription>
                      {t('supervisor.evaluationDescription')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {project.students.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => setEvaluationModal({ open: true, studentId: student.id })}
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
                          <Button variant="outline" size="sm">
                            {t('nav.evaluation')}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    {t('supervisor.studentIdRequired')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {t('supervisor.studentIdRequiredMessage')}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </BlockContent>

      {/* Evaluation Modal */}
      {id && evaluationModal.open && evaluationModal.studentId && (
        <ModalDialog
          open={evaluationModal.open}
          onOpenChange={(open) => !open && handleCloseEvaluationModal()}
          title={t('supervisor.evaluateProject')}
          className="sm:max-w-[600px]"
        >
          <div className="mt-2">
            <EvaluationForm
              projectId={id}
              studentId={evaluationModal.studentId}
              onSuccess={() => {
                handleCloseEvaluationModal()
              }}
            />
          </div>
        </ModalDialog>
      )}
    </MainLayout>
  )
}
