import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalDialog } from '@/components/common'
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, Label } from '@/components/ui'
import { Loader2, Users, Send, AlertCircle, User, FileText, CheckCircle, MessageSquare } from 'lucide-react'
import { proposalService } from '../api/proposal.service'
import { useToast } from '@/components/common'
import { cn } from '@/lib/utils'
import type { Proposal } from '@/types/project.types'

interface StudentGroup {
  id: string
  name: string
  code: string
  leader: {
    id: string
    name: string
    email: string
  }
}

interface AssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proposal: Proposal | null
  onSuccess?: () => void
}

export function AssignmentDialog({ open, onOpenChange, proposal, onSuccess }: AssignmentDialogProps) {
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()
  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  const [assignmentType, setAssignmentType] = useState<'direct' | 'request'>('direct')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingGroups, setIsLoadingGroups] = useState(false)

  useEffect(() => {
    if (open && proposal) {
      loadStudentGroups()
      setSelectedGroupId('')
      setNotes('')
      setAssignmentType('direct')
    }
  }, [open, proposal])

  const loadStudentGroups = async () => {
    setIsLoadingGroups(true)
    try {
      const groups = await proposalService.getStudentGroups()
      setStudentGroups(groups)
    } catch (error: any) {
      toastError(error.message || t('proposal.failedToLoadGroups'))
    } finally {
      setIsLoadingGroups(false)
    }
  }

  const handleSubmit = async () => {
    if (!proposal || !selectedGroupId) {
      toastError(t('proposal.selectGroupRequired'))
      return
    }

    if (assignmentType === 'request' && !notes.trim()) {
      toastError(t('proposal.notesRequiredForRequest'))
      return
    }

    setIsLoading(true)
    try {
      if (assignmentType === 'direct') {
        await proposalService.assignToGroup(proposal.id, selectedGroupId)
        toastSuccess(t('proposal.assignedSuccessfully'))
      } else {
        await proposalService.requestAssignment(proposal.id, selectedGroupId, notes)
        toastSuccess(t('proposal.assignmentRequested'))
      }
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toastError(error.response?.data?.message || error.message || t('proposal.assignmentFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  if (!proposal) return null

  const selectedGroup = studentGroups.find(g => g.id === selectedGroupId)

  return (
    <ModalDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('proposal.assignToGroup')}
    >
      <div className="space-y-6">
        {/* Proposal Info */}
        <div className="p-4 rounded-lg bg-muted/50 border">
          <h4 className="text-sm font-medium mb-1">{proposal.title}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {proposal.description}
          </p>
        </div>

        {/* Assignment Type */}
        <div className="space-y-2">
          <Label>{t('proposal.assignmentType')}</Label>
          <Select value={assignmentType} onValueChange={(value) => setAssignmentType(value as 'direct' | 'request')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="direct">{t('proposal.directAssignment')}</SelectItem>
              <SelectItem value="request">{t('proposal.requestAssignment')}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {assignmentType === 'direct'
              ? t('proposal.directAssignmentDescription')
              : t('proposal.requestAssignmentDescription')
            }
          </p>
        </div>

        {/* Student Group Selection */}
        <div className="space-y-2">
          <Label>
            {t('proposal.selectStudentGroup')} <span className="text-destructive">*</span>
          </Label>
          {isLoadingGroups ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">{t('common.loading')}</span>
            </div>
          ) : (
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger>
                <SelectValue placeholder={t('proposal.selectGroup')} />
              </SelectTrigger>
              <SelectContent>
                {studentGroups.length === 0 ? (
                  <div className="px-2 py-4 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      {t('proposal.noGroupsAvailable')}
                    </p>
                  </div>
                ) : (
                  studentGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {group.code?.charAt(0) || 'G'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{group.name || group.code}</div>
                          <div className="text-xs text-muted-foreground">
                            {t('proposal.leader')}: {group.leader.name}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Notes for Request Assignment */}
        {assignmentType === 'request' && (
          <div className="space-y-2">
            <Label>
              {t('proposal.notes')} <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('proposal.assignmentNotesPlaceholder')}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {t('proposal.notesDescription')}
            </p>
          </div>
        )}

        {/* Selected Group Info */}
        {selectedGroup && (
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {selectedGroup.name || selectedGroup.code}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {t('proposal.leader')}: {selectedGroup.leader.name} ({selectedGroup.leader.email})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !selectedGroupId || (assignmentType === 'request' && !notes.trim())}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('common.processing')}
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {assignmentType === 'direct' ? t('proposal.assign') : t('proposal.requestAssignment')}
              </>
            )}
          </Button>
        </div>
      </div>
    </ModalDialog>
  )
}
