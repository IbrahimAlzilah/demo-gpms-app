import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/components/common'
import { useBatchRegisterProjects } from '../../hooks/useProjectOperations'
import { usePeriodCheck } from '@/hooks/usePeriodCheck'
import { useMyGroup } from '@/pages/student/groups/hooks/useGroups'
import { useAuthStore } from '@/pages/auth/login'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import {
  AlertCircle,
  Users,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import type { Project } from '@/types/project.types'

interface BatchRegistrationFormProps {
  projects: Project[]
  onSuccess?: () => void
  onCancel?: () => void
}

export function BatchRegistrationForm({
  projects,
  onSuccess,
  onCancel,
}: BatchRegistrationFormProps) {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const batchRegister = useBatchRegisterProjects()
  const { data: studentGroup, isLoading: groupLoading } = useMyGroup()
  const { isPeriodActive, isLoading: periodLoading } = usePeriodCheck('project_registration')
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set())
  const { toastSuccess, toastError } = useToast()

  // Check if user is group leader
  const isGroupLeader = studentGroup?.leaderId === user?.id

  const handleToggleProject = (projectId: string) => {
    setSelectedProjectIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(projectId)) {
        newSet.delete(projectId)
      } else {
        newSet.add(projectId)
      }
      return newSet
    })
  }

  const handleSubmit = async () => {
    if (!isPeriodActive) {
      toastError(t('project.periodClosed'))
      return
    }

    if (!studentGroup) {
      toastError(t('project.noGroupRequired'))
      return
    }

    if (!isGroupLeader) {
      toastError(t('registration.onlyLeaderCanRegister'))
      return
    }

    if (selectedProjectIds.size === 0) {
      toastError(t('registration.selectAtLeastOneProject'))
      return
    }

    if (selectedProjectIds.size > 5) {
      toastError(t('registration.maxProjectsLimit'))
      return
    }

    try {
      await batchRegister.mutateAsync({
        projectIds: Array.from(selectedProjectIds),
        studentGroupId: studentGroup.id,
      })
      toastSuccess(t('registration.batchRegistrationSuccess'))
      setTimeout(() => {
        onSuccess?.()
      }, 2000)
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t('registration.batchRegistrationError')
      toastError(errorMessage)
    }
  }

  if (groupLoading || periodLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (!studentGroup) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-2 p-3 text-sm text-warning bg-warning/10 border border-warning/20 rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium mb-1">{t('project.noGroupRequired')}</p>
              <p className="text-xs text-muted-foreground">
                {t('project.createGroupFirst')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isGroupLeader) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-2 p-3 text-sm text-warning bg-warning/10 border border-warning/20 rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium mb-1">{t('registration.onlyLeaderCanRegister')}</p>
              <p className="text-xs text-muted-foreground">
                {t('registration.onlyLeaderCanRegisterDescription')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          {t('registration.batchRegister')}
        </CardTitle>
        <CardDescription>
          {t('registration.batchRegisterDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Group Info */}
        <div className="p-3 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{t('project.group')}</span>
          </div>
          <p className="text-sm">
            {studentGroup.name || `${t('project.group')} #${studentGroup.id}`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {studentGroup.memberCount}/{studentGroup.maxMembers} {t('project.members')}
          </p>
        </div>

        {!isPeriodActive && (
          <div className="flex items-start gap-2 p-3 text-sm text-warning bg-warning/10 border border-warning/20 rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{t('project.periodClosed')}</span>
          </div>
        )}

        {/* Projects List */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('registration.selectProjects')}</label>
          <div className="space-y-2 max-h-[400px] overflow-y-auto border rounded-lg p-4">
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('registration.noProjectsAvailable')}
              </p>
            ) : (
              projects.map((project) => {
                const isSelected = selectedProjectIds.has(project.id)
                const isFull = project.currentStudents >= project.maxStudents
                
                return (
                  <div
                    key={project.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-primary/10 border-primary'
                        : 'bg-background border-border hover:bg-muted/50'
                    } ${isFull ? 'opacity-60' : ''}`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleProject(project.id)}
                      disabled={isFull || !isPeriodActive}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm">{project.title}</h4>
                        {isFull && (
                          <span className="text-xs text-destructive shrink-0">
                            {t('project.full')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>
                          {t('project.supervisor')}: {project.supervisor?.name || t('project.noSupervisor')}
                        </span>
                        <span>
                          {t('project.students')}: {project.currentStudents}/{project.maxStudents}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          {selectedProjectIds.size > 0 && (
            <p className="text-xs text-muted-foreground">
              {t('registration.selectedProjects', { count: selectedProjectIds.size })}
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={handleSubmit}
            disabled={
              batchRegister.isPending ||
              !isPeriodActive ||
              selectedProjectIds.size === 0
            }
            className="flex-1"
          >
            {batchRegister.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('registration.submitting')}
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {t('registration.submitBatchRegistration')}
              </>
            )}
          </Button>
          {onCancel && (
            <Button onClick={onCancel} variant="outline">
              {t('common.cancel')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
