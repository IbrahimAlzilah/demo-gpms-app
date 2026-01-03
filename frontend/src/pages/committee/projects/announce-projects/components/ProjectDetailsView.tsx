import { ModalDialog, StatusBadge, LoadingSpinner } from '@/components/common'
import { User, Users, Building2, Calendar, FileText, Tag, Briefcase } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import { useTranslation } from 'react-i18next'
import { useProject } from '../hooks/useProject'

interface ProjectDetailsViewProps {
  projectId: string | null
  open: boolean
  onClose: () => void
}

export function ProjectDetailsView({
  projectId,
  open,
  onClose,
}: ProjectDetailsViewProps) {
  const { t } = useTranslation()
  const { data: project, isLoading } = useProject(projectId || '')

  if (!open || !projectId) {
    return null
  }

  if (isLoading) {
    return (
      <ModalDialog
        open={open}
        onOpenChange={onClose}
        title={t('committee.announce.viewDetails') || 'تفاصيل المشروع'}
      >
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner />
        </div>
      </ModalDialog>
    )
  }

  if (!project) {
    return null
  }

  return (
    <ModalDialog
      open={open}
      onOpenChange={onClose}
      title={project.title}
      size="xl"
    >
      <div className="max-w-4xl max-h-[90vh] overflow-y-auto space-y-4">
        {/* Status and Dates */}
        <div className="flex items-center gap-4 text-sm pb-4 border-b">
          <StatusBadge status={project.status} />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{t('common.createdAt') || 'تاريخ الإنشاء'}: {formatDate(project.createdAt)}</span>
          </div>
          {project.updatedAt && project.updatedAt !== project.createdAt && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-xs">
                {t('common.updatedAt') || 'آخر تحديث'}: {formatDate(project.updatedAt)}
              </span>
            </div>
          )}
        </div>

        {/* Project Description */}
        <div className="p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold">{t('project.description') || 'الوصف'}</h4>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {project.description}
          </p>
        </div>

        {/* Project Information Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Supervisor Information */}
          {project.supervisor && (
            <div className="p-4 rounded-lg bg-muted border border-muted-foreground/20">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold">{t('project.supervisor') || 'المشرف'}</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">{project.supervisor.name}</span>
                </div>
                {project.supervisor.email && (
                  <div className="text-muted-foreground">
                    <span className="font-medium">{t('common.email') || 'البريد الإلكتروني'}: </span>
                    {project.supervisor.email}
                  </div>
                )}
                {project.supervisor.department && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    <span>
                      <span className="font-medium">{t('common.department') || 'القسم'}: </span>
                      {project.supervisor.department}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Students Information */}
          <div className="p-4 rounded-lg bg-muted border border-muted-foreground/20">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">{t('project.students') || 'الطلاب'}</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">
                  {project.currentStudents || 0} / {project.maxStudents}
                </span>
                <span className="text-muted-foreground ml-2">
                  {t('project.studentsCount') || 'طالب'}
                </span>
              </div>
              {project.students && project.students.length > 0 && (
                <div className="mt-3 pt-3 border-t border-muted-foreground/20">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    {t('project.registeredStudents') || 'الطلاب المسجلون'}:
                  </p>
                  <div className="space-y-1">
                    {project.students.map((student) => (
                      <div key={student.id} className="text-sm">
                        <span className="font-medium">{student.name}</span>
                        {student.email && (
                          <span className="text-muted-foreground ml-2 text-xs">
                            ({student.email})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Specialization */}
          {project.specialization && (
            <div className="p-4 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold">{t('project.specialization') || 'التخصص'}</h4>
              </div>
              <p className="text-sm font-medium">{project.specialization}</p>
            </div>
          )}

          {/* Keywords */}
          {project.keywords && project.keywords.length > 0 && (
            <div className="p-4 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold">{t('project.keywords') || 'الكلمات المفتاحية'}</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-muted rounded-md border border-border"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Documents */}
        {project.documents && project.documents.length > 0 && (
          <div className="p-4 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">{t('project.documents') || 'المستندات'}</h4>
            </div>
            <div className="space-y-2">
              {project.documents.map((doc, index) => (
                <div key={index} className="text-sm text-muted-foreground">
                  {doc}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ModalDialog>
  )
}
