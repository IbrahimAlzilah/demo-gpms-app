import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui'
import type { Project } from '@/types/project.types'
import type { User } from '@/types/user.types'
import { ModalDialog } from '@/components/common'

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

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedSupervisor('')
      setNotes('')
      setAssignmentType('request')
    }
  }, [open])

  const handleSubmit = async () => {
    if (!project || !selectedSupervisor) return
    // Allow change: backend will cancel previous request and assign/request the new supervisor
    try {
      await onAssign(project.id, selectedSupervisor, assignmentType === 'request', notes)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to assign supervisor:', error)
      // Don't close dialog on error so user can retry
    }
  }

  return (
    <ModalDialog open={open} onOpenChange={onOpenChange} title={t('supervisor_assignments.assignSupervisor', { defaultValue: 'Assign Supervisor' })} description={project?.title}>
      <div className="space-y-6 py-4">
        {/* Supervisor Selection */}
        <div className="space-y-2">
          <Label>{t('supervisor_assignments.selectSupervisor', { defaultValue: 'Select Supervisor' })}</Label>
          <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor}>
            <SelectTrigger>
              <SelectValue placeholder={t('supervisor_assignments.selectSupervisor', { defaultValue: 'Select Supervisor' })} />
            </SelectTrigger>
            <SelectContent>
              {supervisors.map((supervisor) => (
                <SelectItem key={supervisor.id} value={supervisor.id}>
                  {/* {supervisor.name} ({supervisor.email}) */}
                  {supervisor.name} <span className="text-xs text-muted-foreground">({supervisor?.department})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Assignment Type */}
        <div className="space-y-3">
          <Label>{t('supervisor_assignments.assignmentType', { defaultValue: 'Assignment Type' })}</Label>
          <RadioGroup value={assignmentType} onValueChange={(value) => setAssignmentType(value as 'direct' | 'request')} className="bg-muted/30 p-3 rounded-lg border gap-3">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="request" id="request" />
              <Label htmlFor="request" className="font-normal">
                {t('supervisor_assignments.requestApproval', { defaultValue: 'Request Approval (Recommended)' })}
                <p className="text-xs text-muted-foreground">
                  {t('supervisor_assignments.requestApprovalDesc', { defaultValue: 'Send request to supervisor for approval' })}
                </p>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="direct" id="direct" />
              <Label htmlFor="direct" className="font-normal">
                {t('supervisor_assignments.directAssignment', { defaultValue: 'Direct Assignment' })}
                <p className="text-xs text-muted-foreground">
                  {t('supervisor_assignments.directAssignmentDesc', { defaultValue: 'Assign immediately without approval' })}
                </p>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">
            {assignmentType === 'request'
              ? t('supervisor_assignments.notesForSupervisor', { defaultValue: 'Notes for Supervisor' })
              : t('supervisor_assignments.notes', { defaultValue: 'Notes' })}
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('supervisor_assignments.assignmentNotesPlaceholder', { defaultValue: 'Add any notes...' })}
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
          {t('common.cancel', { defaultValue: 'Cancel' })}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedSupervisor || loading}
        >
          {loading ? t('common.loading', { defaultValue: 'Loading...' }) :
            assignmentType === 'request'
              ? t('supervisor_assignments.sendRequest', { defaultValue: 'Send Request' })
              : t('supervisor_assignments.assign', { defaultValue: 'Assign' })
          }
        </Button>
      </div>
    </ModalDialog>
  )
}
