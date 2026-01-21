import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { Project } from '@/types/project.types'
import type { User } from '@/types/user.types'

interface SupervisorAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  supervisors: User[]
  onAssign: (projectId: string, supervisorId: string, requiresApproval: boolean, notes?: string) => Promise<void>
  loading?: boolean
}

export function SupervisorAssignmentDialog({
  open,
  onOpenChange,
  project,
  supervisors,
  onAssign,
  loading = false,
}: SupervisorAssignmentDialogProps) {
  const { t } = useTranslation()
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('')
  const [assignmentType, setAssignmentType] = useState<'direct' | 'request'>('request')
  const [notes, setNotes] = useState('')

  const handleSubmit = async () => {
    if (!project || !selectedSupervisor) return

    try {
      await onAssign(project.id, selectedSupervisor, assignmentType === 'request', notes)
      onOpenChange(false)
      setSelectedSupervisor('')
      setNotes('')
      setAssignmentType('request')
    } catch (error) {
      console.error('Failed to assign supervisor:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('supervisor.assignSupervisor', { defaultValue: 'Assign Supervisor' })}</DialogTitle>
          <DialogDescription>
            {project?.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Supervisor Selection */}
          <div className="space-y-2">
            <Label>{t('supervisor.selectSupervisor', { defaultValue: 'Select Supervisor' })}</Label>
            <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor}>
              <SelectTrigger>
                <SelectValue placeholder={t('supervisor.selectSupervisor', { defaultValue: 'Select Supervisor' })} />
              </SelectTrigger>
              <SelectContent>
                {supervisors.map((supervisor) => (
                  <SelectItem key={supervisor.id} value={supervisor.id}>
                    {supervisor.name} ({supervisor.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignment Type */}
          <div className="space-y-2">
            <Label>{t('supervisor.assignmentType', { defaultValue: 'Assignment Type' })}</Label>
            <RadioGroup value={assignmentType} onValueChange={(value) => setAssignmentType(value as 'direct' | 'request')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="request" id="request" />
                <Label htmlFor="request" className="font-normal">
                  {t('supervisor.requestApproval', { defaultValue: 'Request Approval (Recommended)' })}
                  <p className="text-xs text-muted-foreground">
                    {t('supervisor.requestApprovalDesc', { defaultValue: 'Send request to supervisor for approval' })}
                  </p>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="direct" id="direct" />
                <Label htmlFor="direct" className="font-normal">
                  {t('supervisor.directAssignment', { defaultValue: 'Direct Assignment' })}
                  <p className="text-xs text-muted-foreground">
                    {t('supervisor.directAssignmentDesc', { defaultValue: 'Assign immediately without approval' })}
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              {assignmentType === 'request'
                ? t('supervisor.notesForSupervisor', { defaultValue: 'Notes for Supervisor' })
                : t('supervisor.notes', { defaultValue: 'Notes' })}
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('supervisor.notesPlaceholder', { defaultValue: 'Add any notes...' })}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t('common.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedSupervisor || loading}>
            {loading ? t('common.loading', { defaultValue: 'Loading...' }) : 
              assignmentType === 'request' 
                ? t('supervisor.sendRequest', { defaultValue: 'Send Request' })
                : t('supervisor.assign', { defaultValue: 'Assign' })
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
