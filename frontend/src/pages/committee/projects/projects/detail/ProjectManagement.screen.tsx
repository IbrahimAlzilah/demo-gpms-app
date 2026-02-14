import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MainLayout } from '@/layouts/MainLayout'
import { BlockContent, ModalDialog } from '@/components/common'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Progress,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { StatusBadge } from '@/components/common/StatusBadge'
import { LoadingSpinner } from '@/components/common'
import { ROUTES } from '@/lib/constants/constants'
import { useProjectManagement } from './ProjectManagement.hook'
import { useToast } from '@/components/common'
import { supervisorAssignmentService } from '../../supervisors/api/supervisor.service'
import { ManageGroupModal } from '../components/ManageGroupModal'
import {
  ChevronLeft,
  FileText,
  Users,
  User,
  CheckCircle2,
  Clock,
  Circle,
  Flag,
  Award,
  FileCheck,
  UserPlus,
  Megaphone,
  Trash2,
  ExternalLink,
  Edit,
  Loader2,
  Settings2,
} from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import type { ProjectStatus } from '@/types/project.types'

const PROJECT_STATUS_OPTIONS: ProjectStatus[] = [
  'draft',
  'available_for_registration',
  'in_progress',
  'completed',
]

interface EditProjectForm {
  title: string
  description: string
  max_students: number
  specialization: string
}

const PHASE_KEYS: Record<string, string> = {
  proposal: 'committee.projectManagement.phaseProposal',
  registration: 'committee.projectManagement.phaseRegistration',
  supervision: 'committee.projectManagement.phaseSupervision',
  documents: 'committee.projectManagement.phaseDocuments',
  milestones: 'committee.projectManagement.phaseMilestones',
  evaluation: 'committee.projectManagement.phaseEvaluation',
}

const WORKFLOW_DETAIL_KEY_PREFIX = 'committee.projectManagement.workflowDetails.'

export function ProjectManagementScreen() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()

  const [editOpen, setEditOpen] = useState(false)
  const [manageGroupOpen, setManageGroupOpen] = useState(false)

  const { data: supervisors = [] } = useQuery({
    queryKey: ['committee-supervisors-list'],
    queryFn: () => supervisorAssignmentService.getAvailableSupervisors(),
  })

  const {
    project,
    statistics,
    workflow,
    isLoading,
    error,
    updateProject,
    updateStatus,
    announceProjects,
    unannounceProjects,
    deleteProject,
  } = useProjectManagement(projectId || '')

  const editForm = useForm<EditProjectForm>({
    defaultValues: {
      title: '',
      description: '',
      max_students: 1,
      specialization: '',
    },
  })

  useEffect(() => {
    if (editOpen && project) {
      editForm.reset({
        title: project.title ?? '',
        description: project.description ?? '',
        max_students: project.maxStudents ?? 1,
        specialization: project.specialization ?? '',
      })
    }
  }, [editOpen, project, editForm])

  const handleEditSubmit = async (data: EditProjectForm) => {
    if (!projectId) return
    try {
      await updateProject.mutateAsync({
        id: projectId,
        payload: {
          title: data.title || undefined,
          description: data.description || undefined,
          max_students: data.max_students,
          specialization: data.specialization || undefined,
        },
      })
      toastSuccess(t('committee.projectManagement.updateSuccess'))
      setEditOpen(false)
    } catch (e) {
      toastError(e instanceof Error ? e.message : t('committee.projectManagement.updateError'))
    }
  }

  const handleStatusChange = async (status: string) => {
    if (!projectId || !project) return
    try {
      await updateStatus.mutateAsync({
        id: projectId,
        payload: { status: status as any, notify_students: true },
      })
      toastSuccess(t('committee.projectManagement.statusUpdated'))
    } catch (e) {
      toastError(e instanceof Error ? e.message : t('common.error'))
    }
  }

  const handleAnnounce = async () => {
    if (!projectId) return
    try {
      await announceProjects.mutateAsync([projectId])
      toastSuccess(t('committee.projectManagement.announced'))
    } catch (e) {
      toastError(e instanceof Error ? e.message : t('common.error'))
    }
  }

  const handleUnannounce = async () => {
    if (!projectId) return
    try {
      await unannounceProjects.mutateAsync([projectId])
      toastSuccess(t('committee.projectManagement.unannounced'))
    } catch (e) {
      toastError(e instanceof Error ? e.message : t('common.error'))
    }
  }

  const handleDelete = async () => {
    if (!projectId || !window.confirm(t('committee.projectManagement.confirmDelete'))) return
    try {
      await deleteProject.mutateAsync(projectId)
      toastSuccess(t('committee.projectManagement.deleted'))
      navigate(ROUTES.PROJECTS_COMMITTEE.PROJECTS)
    } catch (e) {
      toastError(e instanceof Error ? e.message : t('common.error'))
    }
  }

  const handleSupervisorChange = async (value: string) => {
    if (!projectId) return
    const supervisorId = value === '__none__' ? null : value
    try {
      await updateProject.mutateAsync({
        id: projectId,
        payload: { supervisor_id: supervisorId ?? undefined },
      })
      toastSuccess(t('committee.projectManagement.supervisorUpdated', { defaultValue: 'Supervisor updated' }))
    } catch (e) {
      toastError(e instanceof Error ? e.message : t('common.error'))
    }
  }

  if (!projectId) {
    return (
      <MainLayout>
        <BlockContent title={t('common.error')}>
          <p className="text-muted-foreground">{t('committee.projectManagement.projectNotFound')}</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to={ROUTES.PROJECTS_COMMITTEE.PROJECTS}>{t('common.back')}</Link>
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
            {error?.message || t('committee.projectManagement.projectNotFound')}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to={ROUTES.PROJECTS_COMMITTEE.PROJECTS}>{t('common.back')}</Link>
          </Button>
        </BlockContent>
      </MainLayout>
    )
  }

  const phases = workflow?.phases ?? []
  const overallProgress = workflow?.overallProgress ?? 0
  const canAnnounce = project.status === 'draft'
  const canUnannounce = project.status === 'available_for_registration'
  const canDelete = !['in_progress', 'completed'].includes(project.status)

  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in duration-300 pb-10">
        {/* Breadcrumb & Back */}
        {/* <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Button variant="ghost" size="sm" asChild className="gap-1 -ms-2">
            <Link to={ROUTES.PROJECTS_COMMITTEE.PROJECTS}>
              <ChevronLeft className="h-4 w-4" />
              {t('nav.projects')}
            </Link>
          </Button>
          <span>/</span>
          <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-none">
            {project.title}
          </span>
        </div> */}

        {/* Header Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl mb-1">{project.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <StatusBadge status={project.status} />
                  <Select
                    value={project.status}
                    onValueChange={handleStatusChange}
                    disabled={updateStatus.isPending}
                  >
                    <SelectTrigger className="w-[200px] h-8 text-xs">
                      <SelectValue placeholder={t('committee.projectManagement.changeStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {t(`status.${s}`, { defaultValue: s })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span>{t('common.createdAt')}: {formatDate(project.createdAt)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
                  <Edit className="h-4 w-4" />
                  {t('common.edit')}
                </Button>
                {canAnnounce && (
                  <Button size="sm" onClick={handleAnnounce} disabled={announceProjects.isPending}>
                    <Megaphone className="h-4 w-4" />
                    {t('committee.projectManagement.announce')}
                  </Button>
                )}
                {canUnannounce && (
                  <Button size="sm" variant="outline" onClick={handleUnannounce} disabled={unannounceProjects.isPending}>
                    {t('committee.projectManagement.unannounce')}
                  </Button>
                )}
                {canDelete && (
                  <Button size="sm" variant="outline" className="text-destructive" onClick={handleDelete} disabled={deleteProject.isPending}>
                    <Trash2 className="h-4 w-4" />
                    {t('common.delete')}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          {project.description && (
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.description}</p>
            </CardContent>
          )}
        </Card>

        {/* Workflow Progress */}
        {phases.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Flag className="h-5 w-5 text-primary" />
                {t('committee.projectManagement.workflowProgress')}
              </CardTitle>
              <div className="flex items-center gap-4 pt-2">
                <Progress value={overallProgress} className="h-2 flex-1" />
                <span className="text-sm font-medium tabular-nums">{overallProgress}%</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-3">
                {phases.map((phase: { name: string; title: string; status: string; details?: Record<string, unknown> }) => (
                  <li
                    key={phase.name}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border',
                      phase.status === 'completed' && 'bg-success/5 border-success/20',
                      phase.status === 'in_progress' && 'bg-primary/5 border-primary/20',
                      phase.status === 'pending' && 'bg-muted/30 border-border'
                    )}
                  >
                    {phase.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                    ) : phase.status === 'in_progress' ? (
                      <Clock className="h-5 w-5 text-primary shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {t(PHASE_KEYS[phase.name] || phase.name)}
                      </p>
                      {phase.details && typeof phase.details === 'object' && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {Object.entries(phase.details)
                            .map(([k, v]) => {
                              const label = t(`${WORKFLOW_DETAIL_KEY_PREFIX}${k}`, { defaultValue: k })
                              const value = typeof v === 'boolean' ? (v ? '✓' : '—') : (v ?? '—')
                              return `${label}: ${value}`
                            })
                            .join(' · ')}
                        </p>
                      )}
                    </div>
                    <Badge variant={phase.status === 'completed' ? 'default' : 'secondary'} className="shrink-0">
                      {phase.status === 'completed'
                        ? t('common.completed')
                        : phase.status === 'in_progress'
                          ? t('common.inProgress')
                          : t('common.pending')}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Overview Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Supervisor */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('project.supervisor')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={project.supervisorId ?? '__none__'}
                onValueChange={handleSupervisorChange}
                disabled={updateProject.isPending}
              >
                <SelectTrigger className="w-full h-9 text-sm">
                  <SelectValue placeholder={t('common.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{t('common.unassigned')}</SelectItem>
                  {supervisors.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name} {s.department ? `(${s.department})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link to={ROUTES.PROJECTS_COMMITTEE.ASSIGN_SUPERVISORS}>
                  <UserPlus className="h-3 w-3" />
                  {t('committee.projectManagement.assignSupervisor')}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Group / Students */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('project.groups')} / {t('common.students')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {project.currentGroups ?? 0} / {project.maxGroups ?? 1} {t('project.groups')}
                {project.students?.length ? ` · ${project.students.length} ${t('common.students')}` : ''}
              </p>
              {project.assignedGroupId && project.assignedGroup && (
                <div className="mt-2 p-2 rounded-md bg-muted/50 text-xs space-y-1">
                  <p className="font-medium">
                    {project.assignedGroup.name || project.assignedGroup.groupCode || t('project.groups')}
                    {project.assignedGroup.groupCode && ` (${project.assignedGroup.groupCode})`}
                  </p>
                  {project.assignedGroup.leader && (
                    <p className="text-muted-foreground">
                      {t('common.leader')}: {project.assignedGroup.leader.name ?? project.assignedGroup.leader.email}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 gap-1"
                    onClick={() => setManageGroupOpen(true)}
                  >
                    <Settings2 className="h-3 w-3" />
                    {t('committee.projectManagement.manageGroup', { defaultValue: 'Manage group' })}
                  </Button>
                </div>
              )}
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link to={ROUTES.PROJECTS_COMMITTEE.REGISTRATIONS}>
                  <ExternalLink className="h-3 w-3" />
                  {t('committee.projectManagement.viewRegistrations')}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Documents & Grades */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('committee.projectManagement.documentsAndGrades')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statistics ? (
                <div className="text-sm space-y-1">
                  <p>{statistics.documentsCount} {t('project.documents')}</p>
                  <p>{statistics.gradesCount} {t('nav.grades')}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">—</p>
              )}
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link to={ROUTES.PROJECTS_COMMITTEE.GRADES}>
                  <Award className="h-3 w-3" />
                  {t('committee.projectManagement.viewGrades')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('committee.projectManagement.quickActions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to={ROUTES.PROJECTS_COMMITTEE.REQUESTS}>
                  <FileCheck className="h-4 w-4" />
                  {t('nav.processRequests')}
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to={ROUTES.PROJECTS_COMMITTEE.DISTRIBUTE_COMMITTEES}>
                  <Users className="h-4 w-4" />
                  {t('nav.distributeCommittees')}
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to={ROUTES.PROJECTS_COMMITTEE.REGISTRATIONS}>
                  <Users className="h-4 w-4" />
                  {t('nav.manageRegistrations')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manage Group Modal */}
        {project.assignedGroupId && (
          <ManageGroupModal
            groupId={project.assignedGroupId}
            open={manageGroupOpen}
            onOpenChange={setManageGroupOpen}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['committee-project-detail', projectId] })
              queryClient.invalidateQueries({ queryKey: ['committee-project-workflow', projectId] })
            }}
          />
        )}

        {/* Edit Project Dialog */}
        <ModalDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          title={t('committee.projectManagement.editProject')}
          size="xl"
        >
          <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">{t('committee.projectManagement.projectTitle')}</Label>
              <Input
                id="edit-title"
                {...editForm.register('title', { required: true })}
                placeholder={t('committee.projectManagement.projectTitlePlaceholder')}
              />
              {editForm.formState.errors.title && (
                <p className="text-xs text-destructive">{t('common.required')}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">{t('project.description')}</Label>
              <textarea
                id="edit-description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...editForm.register('description')}
                placeholder={t('committee.projectManagement.descriptionPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-max_students">{t('committee.projectManagement.maxStudents')}</Label>
              <Input
                id="edit-max_students"
                type="number"
                min={1}
                {...editForm.register('max_students', { valueAsNumber: true, min: 1 })}
              />
              {editForm.formState.errors.max_students && (
                <p className="text-xs text-destructive">{t('common.required')}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-specialization">{t('committee.projectManagement.specialization')}</Label>
              <Input
                id="edit-specialization"
                {...editForm.register('specialization')}
                placeholder={t('committee.projectManagement.specializationPlaceholder')}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={updateProject.isPending} className="gap-2">
                {updateProject.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t('common.update')}
              </Button>
            </div>
          </form>
        </ModalDialog>
      </div>
    </MainLayout>
  )
}
