import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  Button,
  Badge,
  Input,
  Label,
} from '@/components/ui'
import { ModalDialog, useToast } from '@/components/common'
import { UserCheck, Building, CheckCircle2, Loader2, CalendarClock } from 'lucide-react'
import type { ProjectForDiscussion } from '../api/committee.service'
import type { CommitteeMemberProfile } from '../api/committee.service'

export interface AssignCommitteeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: ProjectForDiscussion | null
  members: CommitteeMemberProfile[]
  committeeMin: number
  committeeMax: number
  onAssign: (
    projectId: string,
    committeeMemberIds: string[],
    defenseStage: 'FD1' | 'FD2',
    defenseScheduledAt?: string | null,
  ) => Promise<void>
  isChangeMode?: boolean
}

function getAvailabilityColor(availability: string) {
  switch (availability) {
    case 'available': return 'bg-green-500'
    case 'moderate': return 'bg-yellow-500'
    case 'busy': return 'bg-orange-500'
    case 'unavailable': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}

function toDatetimeLocal(iso: string | undefined | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromDatetimeLocal(local: string): string | null {
  if (!local || local.trim() === '') return null
  const d = new Date(local)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

export function AssignCommitteeModal({
  open,
  onOpenChange,
  project,
  members,
  committeeMin,
  committeeMax,
  onAssign,
  isChangeMode = false,
}: AssignCommitteeModalProps) {
  const { t } = useTranslation()
  const { toastWarning } = useToast()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [defenseScheduledAt, setDefenseScheduledAt] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (project && open) {
      setDefenseScheduledAt(toDatetimeLocal(project.defenseScheduledAt))
      if (isChangeMode && project.committeeMembers?.length) {
        setSelectedIds(project.committeeMembers.map((m: { id: string }) => m.id))
      } else {
        setSelectedIds([])
      }
    }
  }, [project, open, isChangeMode])

  const toggleMember = (memberId: string) => {
    const member = members.find((m) => m.id === memberId)
    if (!member) return
    if (selectedIds.includes(memberId)) {
      setSelectedIds((prev) => prev.filter((id) => id !== memberId))
      return
    }
    if (selectedIds.length >= committeeMax) {
      toastWarning(t('committee.distribute.maxMembersReached'))
      return
    }
    if (member.availability === 'unavailable') {
      toastWarning(t('committee.distribute.memberUnavailable', { name: member.name }))
      return
    }
    if (member.statistics.availableSlots <= 0) {
      toastWarning(t('committee.distribute.memberAtCapacity', { name: member.name }))
      return
    }
    setSelectedIds((prev) => [...prev, memberId])
  }

  const handleSubmit = async () => {
    if (!project) return
    if (selectedIds.length < committeeMin) {
      toastWarning(t('committee.distribute.minMembersRequired'))
      return
    }
    setSubmitting(true)
    try {
      const defenseStage = project.readyForDefensePhase === 'final_defense_2' ? 'FD2' : 'FD1'
      const scheduledAt = fromDatetimeLocal(defenseScheduledAt)
      await onAssign(project.id, selectedIds, defenseStage, scheduledAt)
      setSelectedIds([])
      setDefenseScheduledAt('')
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setSelectedIds([])
      setDefenseScheduledAt('')
    }
    onOpenChange(open)
  }

  if (!project) return null

  const modalTitle = isChangeMode
    ? t('committee.distribute.changeCommitteeTitle', { title: project.title })
    : t('committee.distribute.formCommitteeTitle', { title: project.title })

  const showFd1Preview = isChangeMode && project.readyForDefensePhase === 'final_defense_2' && project.fd1CommitteePreview?.length

  return (
    <ModalDialog open={open} onOpenChange={handleClose} title={modalTitle}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {showFd1Preview && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30 p-3 text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">
              {t('committee.distribute.fd1CommitteePreview')}
            </p>
            <div className="flex flex-wrap gap-1">
              {project.fd1CommitteePreview!.map((m) => (
                <Badge key={m.id} variant="outline" className="text-xs">
                  {m.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          {t('committee.distribute.selectMembers')} ({t('committee.distribute.minMaxMembers')})
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground col-span-2">{t('committee.distribute.noMembers')}</p>
          ) : (
            members.map((member) => {
              const isUnavailable = member.availability === 'unavailable' || member.statistics.availableSlots <= 0
              const isSelected = selectedIds.includes(member.id)
              return (
                <Card
                  key={member.id}
                  className={`transition-all cursor-pointer ${
                    isUnavailable && !isSelected ? 'opacity-50 cursor-not-allowed' : ''
                  } ${isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                  onClick={() => !isUnavailable && toggleMember(member.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <div className={`mt-1 size-2 rounded-full shrink-0 ${getAvailabilityColor(member.availability)}`} />
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{member.name}</p>
                          {member.profile?.department && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Building className="h-3 w-3" />
                              {member.profile.department}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {member.statistics.currentAssignments}/{member.statistics.maxAllowedProjects} {t('committee.distribute.projects')} · {member.statistics.availableSlots} {t('committee.distribute.slotsAvailable')}
                          </p>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="defense-datetime" className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            {t('committee.distribute.defenseSchedule')}
          </Label>
          <Input
            id="defense-datetime"
            type="datetime-local"
            value={defenseScheduledAt}
            onChange={(e) => setDefenseScheduledAt(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">{t('committee.distribute.defenseScheduleHint')}</p>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between gap-4 pt-2 border-t">
            <p className="text-sm text-primary flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              {t('committee.distribute.membersSelected', { count: selectedIds.length })}
              {selectedIds.length < committeeMin && (
                <Badge variant="secondary" className="ml-2">{t('committee.distribute.needMoreMembers')}</Badge>
              )}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleClose(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={selectedIds.length < committeeMin || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    {t('committee.distribute.assignCommittee')}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </ModalDialog>
  )
}
