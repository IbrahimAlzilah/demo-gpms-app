import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Button, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Checkbox } from '@/components/ui'
import { ModalDialog, LoadingSpinner, useToast } from '@/components/common'
import { apiClient } from '@/lib/axios'
import { Loader2 } from 'lucide-react'
import type { Project } from '@/types/project.types'

interface StudentGroup {
  id: string
  name: string
  code: string
  leader: {
    id: string
    name: string
    email: string
  }
  members_count: number
}

interface ManualRegistrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRegister: (projectId: string, groupId: string, autoApprove: boolean) => Promise<void>
  loading?: boolean
}

export function ManualRegistrationDialog({
  open,
  onOpenChange,
  onRegister,
  loading = false,
}: ManualRegistrationDialogProps) {
  const { t } = useTranslation()
  const { toastError } = useToast()
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [autoApprove, setAutoApprove] = useState(true)

  // Fetch available projects
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['available-projects'],
    queryFn: async () => {
      const response = await apiClient.get('/projects-committee/projects?status=available_for_registration')
      return Array.isArray(response.data) ? response.data : []
    },
    enabled: open,
  })

  // Fetch student groups
  const { data: groups, isLoading: groupsLoading } = useQuery<StudentGroup[]>({
    queryKey: ['student-groups'],
    queryFn: async () => {
      const response = await apiClient.get('/projects-committee/registrations/groups')
      return Array.isArray(response.data) ? response.data : []
    },
    enabled: open,
  })

  useEffect(() => {
    if (!open) {
      setSelectedProject('')
      setSelectedGroup('')
      setAutoApprove(true)
    }
  }, [open])

  const handleSubmit = async () => {
    if (!selectedProject || !selectedGroup) return

    try {
      await onRegister(selectedProject, selectedGroup, autoApprove)
      onOpenChange(false)
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || 'registration.manualRegistrationError'
      toastError(errorMsg)
    }
  }

  const isLoading = projectsLoading || groupsLoading
  const isSubmitDisabled = !selectedProject || !selectedGroup || loading || isLoading

  return (
    <ModalDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('registration.manualRegistration')}
      size="md"
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : (
          <>
            {/* Project Selection */}
            <div className="space-y-2">
              <Label>{t('project.selectProject')}</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder={t('project.selectProject')} />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div>
                        <p className="font-medium">{project.title}</p>
                        {project.supervisor && (
                          <p className="text-xs text-muted-foreground">
                            {t('project.supervisor')}: {project.supervisor.name}
                          </p>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Group Selection */}
            <div className="space-y-2">
              <Label>{t('group.selectGroup')}</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue placeholder={t('group.selectGroup')} />
                </SelectTrigger>
                <SelectContent>
                  {groups?.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      <div>
                        <p className="font-medium">{group.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('group.code')}: {group.code} |{' '}
                          {t('group.leader')}: {group.leader.name} |{' '}
                          {t('group.members')}: {group.members_count}
                        </p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Auto Approve Option */}
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="autoApprove"
                checked={autoApprove}
                onCheckedChange={(checked) => setAutoApprove(checked as boolean)}
              />
              <Label
                htmlFor="autoApprove"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {t('registration.autoApprove')}
              </Label>
            </div>

            {!autoApprove && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                {t('registration.autoApproveNote')}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('common.loading')}
            </>
          ) : (
            t('common.register')
          )}
        </Button>
      </div>
    </ModalDialog>
  )
}
