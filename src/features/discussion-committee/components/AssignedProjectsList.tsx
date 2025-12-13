import { useTranslation } from 'react-i18next'
import { useCommitteeProjects } from '../hooks/useCommitteeProjects'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { EmptyState } from '../../../components/common/EmptyState'
import { StatusBadge } from '../../../components/common/StatusBadge'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../lib/constants'
import { Briefcase, User, Users, Award } from 'lucide-react'

export function AssignedProjectsList() {
  const { t } = useTranslation()
  const { data: projects, isLoading } = useCommitteeProjects()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!projects || projects.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title={t('discussion.noProjects') || 'لا توجد مشاريع معينة لك حالياً'}
        description={t('discussion.noProjectsDescription') || 'لم يتم تعيين أي مشاريع للجنة المناقشة بعد'}
      />
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="line-clamp-2">{project.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {project.description}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>
                  {t('discussion.supervisor') || 'المشرف'}: {project.supervisor?.name || t('common.unassigned') || 'غير معين'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {project.currentStudents}/{project.maxStudents} {t('common.students') || 'طالب'}
                </span>
              </div>
              <StatusBadge status={project.status} />
            </div>
            <Link to={`${ROUTES.DISCUSSION_COMMITTEE.EVALUATION}?projectId=${project.id}`}>
              <Button variant="outline" className="w-full">
                <Award className="ml-2 h-4 w-4" />
                {t('discussion.evaluateProject') || 'تقييم المشروع'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

