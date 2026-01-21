import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { LoadingSpinner } from '@/components/common'
import { apiClient } from '@/lib/axios'
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
    } catch (error) {
      console.error('Failed to register group:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {t('registration.manualRegistration', { defaultValue: 'Manual Registration' })}
          </DialogTitle>
          <DialogDescription>
            {t('registration.manualRegistrationDesc', { 
              defaultValue: 'Register a student group to a project manually' 
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {projectsLoading || groupsLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Project Selection */}
              <div className="space-y-2">
                <Label>{t('project.selectProject', { defaultValue: 'Select Project' })}</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('project.selectProject', { defaultValue: 'Select Project' })} />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div>
                          <p className="font-medium">{project.title}</p>
                          {project.supervisor && (
                            <p className="text-xs text-muted-foreground">
                              {t('project.supervisor', { defaultValue: 'Supervisor' })}: {project.supervisor.name}
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
                <Label>{t('group.selectGroup', { defaultValue: 'Select Student Group' })}</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('group.selectGroup', { defaultValue: 'Select Student Group' })} />
                  </SelectTrigger>
                  <SelectContent>
                    {groups?.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        <div>
                          <p className="font-medium">{group.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {t('group.code', { defaultValue: 'Code' })}: {group.code} | 
                            {' '}{t('group.leader', { defaultValue: 'Leader' })}: {group.leader.name} |
                            {' '}{t('group.members', { defaultValue: 'Members' })}: {group.members_count}
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
                  {t('registration.autoApprove', { defaultValue: 'Auto-approve registration' })}
                </Label>
              </div>

              {!autoApprove && (
                <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                  {t('registration.autoApproveNote', { 
                    defaultValue: 'The registration will remain pending until manually approved' 
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t('common.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedProject || !selectedGroup || loading || projectsLoading || groupsLoading}
          >
            {loading ? t('common.loading', { defaultValue: 'Loading...' }) : 
              t('common.register', { defaultValue: 'Register' })
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
