import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Button, Label, Input, Textarea } from '@/components/ui'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { AlertCircle, Mail, Loader2, ChevronDown, Check, User } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { groupInviteSchema, type GroupInviteSchema } from '../schema'
import { useInviteGroupMember } from '../hooks/useGroupOperations'
import { groupService } from '../api/group.service'
import type { ProjectGroup } from '@/types/project.types'
import { cn } from '@/lib/utils'

interface StudentOption {
  id: string
  name: string
  email: string
  studentId: string | null
}

interface GroupInviteFormProps {
  group: ProjectGroup
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function GroupInviteForm({ group, onSuccess, onError }: GroupInviteFormProps) {
  const { t } = useTranslation()
  const inviteMember = useInviteGroupMember()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<GroupInviteSchema>({
    resolver: zodResolver(groupInviteSchema(t)),
    defaultValues: {
      inviteeId: '',
      message: '',
    },
  })

  const inviteeId = watch('inviteeId')
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Load all students when popover opens; filter as user types (no minimum characters)
  const { data: students = [], isLoading: searchLoading } = useQuery({
    queryKey: ['group-invite-search', group.id, debouncedSearch],
    queryFn: () => groupService.searchStudentsForInvite(group.id, debouncedSearch),
    enabled: popoverOpen,
    staleTime: 30000,
  })

  // Sync form value with selected student
  useEffect(() => {
    if (selectedStudent) {
      setValue('inviteeId', selectedStudent.id, { shouldValidate: true })
    } else {
      setValue('inviteeId', '', { shouldValidate: true })
    }
  }, [selectedStudent, setValue])

  const handleSelectStudent = useCallback((student: StudentOption) => {
    setSelectedStudent(student)
    setSearchQuery('')
    setPopoverOpen(false)
  }, [])

  const handleClearSelection = useCallback(() => {
    setSelectedStudent(null)
    setValue('inviteeId', '', { shouldValidate: true })
  }, [setValue])

  const onSubmit = async (data: GroupInviteSchema) => {
    if (group.members.length >= group.maxMembers) {
      onError?.(t('groups.fullCapacity'))
      return
    }

    try {
      await inviteMember.mutateAsync({
        groupId: group.id,
        inviteeId: data.inviteeId,
        message: data.message?.trim() || undefined,
      })
      reset()
      setSelectedStudent(null)
      onSuccess?.()
    } catch (err) {
      onError?.(err instanceof Error ? err.message : t('groups.inviteError'))
    }
  }

  const displaySelected = selectedStudent
    ? `${selectedStudent.name}${selectedStudent.studentId ? ` (${selectedStudent.studentId})` : ''}`
    : ''

  const memberCount = group.members?.length ?? 0
  const maxMembers = group.maxMembers ?? 5
  const isGroupFull = memberCount >= maxMembers

  if (isGroupFull) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {t('groups.groupFull')}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="student-select">
          {t('groups.selectStudent')} <span className="text-destructive">*</span>
        </Label>
        <Popover
          open={popoverOpen}
          onOpenChange={(open) => {
            setPopoverOpen(open)
            if (!open) setSearchQuery('')
          }}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={popoverOpen}
              className={cn(
                'w-full justify-between font-normal h-10',
                !displaySelected && 'text-muted-foreground',
                errors.inviteeId && 'border-destructive'
              )}
            >
              {displaySelected || t('groups.searchStudentPlaceholder')}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <div className="p-2 border-b">
              <Input
                placeholder={t('groups.searchByNameOrId')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                className="h-9"
                autoFocus
                aria-label={t('groups.searchByNameOrId')}
              />
            </div>
            <div className="max-h-[280px] overflow-y-auto p-1">
              {searchLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : students.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {debouncedSearch
                    ? t('common.noResults')
                    : t('groups.noStudentsToInvite')}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {students.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => handleSelectStudent(student)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        selectedStudent?.id === student.id && 'bg-accent'
                      )}
                    >
                      <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex flex-col items-start text-left min-w-0">
                        <span className="font-medium truncate w-full">{student.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {student.studentId || student.email}
                        </span>
                      </div>
                      {selectedStudent?.id === student.id && (
                        <Check className="ml-auto h-4 w-4 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        {selectedStudent && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-1 h-auto px-0 text-muted-foreground hover:text-foreground"
            onClick={handleClearSelection}
          >
            {t('groups.clearSelection')}
          </Button>
        )}
        {errors.inviteeId && (
          <p className="text-sm text-destructive flex items-center gap-1 mt-1">
            <AlertCircle className="h-3 w-3" />
            {errors.inviteeId.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="inviteMessage">
          {t('groups.message')} ({t('common.optional')})
        </Label>
        <Textarea
          id="inviteMessage"
          {...register('message')}
          placeholder={t('groups.messagePlaceholder')}
          rows={3}
        />
      </div>
      <Button
        type="submit"
        disabled={inviteMember.isPending || !inviteeId}
        className="w-full"
      >
        {inviteMember.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('groups.sending')}
          </>
        ) : (
          <>
            <Mail className="size-4" />
            {t('groups.sendInvitation')}
          </>
        )}
      </Button>
    </form>
  )
}
