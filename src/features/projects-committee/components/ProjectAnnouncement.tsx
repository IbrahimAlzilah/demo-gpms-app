import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useApprovedProjects, useAnnounceProjects } from '../hooks/useProjectAnnouncement'
import { Card, CardContent } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { EmptyState } from '../../../components/common/EmptyState'
import { useToast } from '../../../components/common/NotificationToast'
import { Briefcase, CheckCircle2, AlertCircle, Loader2, Megaphone } from 'lucide-react'

export function ProjectAnnouncement() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const { data: projects, isLoading } = useApprovedProjects()
  const announceProjects = useAnnounceProjects()
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set())

  const toggleProject = (projectId: string) => {
    const newSelected = new Set(selectedProjects)
    if (newSelected.has(projectId)) {
      newSelected.delete(projectId)
    } else {
      newSelected.add(projectId)
    }
    setSelectedProjects(newSelected)
  }

  const handleAnnounce = async () => {
    if (selectedProjects.size === 0) {
      showToast(t('committee.announce.selectAtLeastOne') || 'يرجى اختيار مشروع واحد على الأقل', 'warning')
      return
    }

    try {
      await announceProjects.mutateAsync(Array.from(selectedProjects))
      showToast(t('committee.announce.success') || 'تم إعلان المشاريع بنجاح', 'success')
      setSelectedProjects(new Set())
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t('committee.announce.error') || 'فشل إعلان المشاريع',
        'error'
      )
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!projects || projects.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title={t('committee.announce.noProjects') || 'لا توجد مشاريع معتمدة للإعلان'}
        description={t('committee.announce.noProjectsDescription') || 'جميع المشاريع المعتمدة تم إعلانها بالفعل'}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">
            {t('committee.announce.approvedProjects') || 'المشاريع المعتمدة'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('committee.announce.selectedCount', { count: selectedProjects.size }) || `${selectedProjects.size} محدد`}
          </p>
        </div>
        <Button
          onClick={handleAnnounce}
          disabled={selectedProjects.size === 0 || announceProjects.isPending}
          className="w-full sm:w-auto"
        >
          {announceProjects.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('committee.announce.announcing') || 'جاري الإعلان...'}
            </>
          ) : (
            <>
              <Megaphone className="mr-2 h-4 w-4" />
              {t('committee.announce.announceSelected') || 'إعلان المشاريع المحددة'}
            </>
          )}
        </Button>
      </div>

      <div className="space-y-3">
        {projects.map((project) => (
          <Card
            key={project.id}
            className={`cursor-pointer transition-all ${
              selectedProjects.has(project.id)
                ? 'border-primary bg-primary/5 shadow-md'
                : 'hover:bg-muted hover:shadow-sm'
            }`}
            onClick={() => toggleProject(project.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <h4 className="font-semibold">{project.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                  <div className="text-xs text-muted-foreground">
                    {t('committee.announce.supervisor') || 'المشرف'}: {project.supervisor?.name || t('common.unassigned') || 'غير معين'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedProjects.has(project.id) && (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  )}
                  <input
                    type="checkbox"
                    checked={selectedProjects.has(project.id)}
                    onChange={() => toggleProject(project.id)}
                    className="h-4 w-4"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

