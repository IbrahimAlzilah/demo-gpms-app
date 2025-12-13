import { useTranslation } from 'react-i18next'
import { useSupervisorProjects } from '../hooks/useSupervisorProjects'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { EmptyState } from '../../../components/common/EmptyState'
import { StatusBadge } from '../../../components/common/StatusBadge'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../../lib/constants'
import { Briefcase, Users, Eye } from 'lucide-react'

export function ProjectList() {
  const { t } = useTranslation()
  const { data: projects, isLoading } = useSupervisorProjects()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!projects || projects.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title={t('supervisor.noProjects') || 'لا توجد مشاريع تحت إشرافك'}
        description={t('supervisor.noProjectsDescription') || 'لم يتم تعيين أي مشاريع لك بعد'}
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
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {project.currentStudents}/{project.maxStudents} {t('common.students') || 'طالب'}
                </span>
              </div>
              <StatusBadge status={project.status} />
            </div>
            <Link to={`${ROUTES.SUPERVISOR.PROJECTS}/${project.id}`}>
              <Button variant="outline" className="w-full">
                <Eye className="ml-2 h-4 w-4" />
                {t('common.viewDetails') || 'عرض التفاصيل'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

