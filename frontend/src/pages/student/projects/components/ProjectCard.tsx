import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Briefcase, Users, ArrowLeft } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import type { Project } from '@/types/project.types'

interface ProjectCardProps {
  project: Project
  onRegister?: (projectId: string) => void
  isRegistered?: boolean
  canRegister?: boolean
}

export function ProjectCard({
  project,
  onRegister,
  isRegistered = false,
  canRegister = false,
}: ProjectCardProps) {
  const { t } = useTranslation()
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="mb-2">{project.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>
                  {project.currentStudents}/{project.maxStudents}
                </span>
              </div>
              {project.supervisor && (
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{project.supervisor.name}</span>
                </div>
              )}
            </div>
          </div>
          <StatusBadge status={project.status} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {project.description}
        </p>
        {project.specialization && (
          <div className="mb-4">
            <Badge variant="outline">{project.specialization}</Badge>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {t('project.createdAt')}: {formatDate(project.createdAt)}
          </span>
          <div className="flex gap-2">
            {isRegistered ? (
              <Button variant="outline" size="sm" disabled>
                {t('project.registered')}
              </Button>
            ) : canRegister ? (
              <Button
                size="sm"
                onClick={() => onRegister?.(project.id)}
              >
                {t('project.register')}
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                {t('project.unavailable')}
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/student/projects/${project.id}`}>
                {t('project.details')}
                <ArrowLeft className="mr-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
