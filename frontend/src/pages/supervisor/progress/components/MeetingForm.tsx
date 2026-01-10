import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Button, Input, Textarea, Label } from '@/components/ui'
import { ModalDialog } from '@/components/common'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { ProjectMeeting, Project } from '@/types/project.types'
import type { MeetingFormData } from '../types/meeting.types'

const meetingFormSchema = (t: (key: string) => string) => z.object({
  scheduledDate: z.string().min(1, t('meeting.scheduledDateRequired')),
  duration: z.number().min(15).max(480).optional(),
  location: z.string().optional(),
  agenda: z.string().optional(),
  attendeeIds: z.array(z.string()).optional(),
})

interface MeetingFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: MeetingFormData) => Promise<void>
  meeting?: ProjectMeeting | null
  project?: Project | null
  isPending?: boolean
}

export function MeetingForm({
  open,
  onClose,
  onSubmit,
  meeting,
  project,
  isPending = false,
}: MeetingFormProps) {
  const { t } = useTranslation()
  const isEditMode = !!meeting

  const form = useForm<MeetingFormData>({
    resolver: zodResolver(meetingFormSchema(t)),
    defaultValues: {
      scheduledDate: meeting?.scheduledDate
        ? new Date(meeting.scheduledDate).toISOString().slice(0, 16)
        : '',
      duration: meeting?.duration || 60,
      location: meeting?.location || '',
      agenda: meeting?.agenda || '',
      attendeeIds: meeting?.attendees || [],
    },
  })

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = form
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>(
    meeting?.attendees || []
  )

  useEffect(() => {
    if (meeting?.attendees) {
      setSelectedAttendees(meeting.attendees)
      setValue('attendeeIds', meeting.attendees)
    }
  }, [meeting, setValue])

  const handleAttendeeToggle = (studentId: string) => {
    const newAttendees = selectedAttendees.includes(studentId)
      ? selectedAttendees.filter(id => id !== studentId)
      : [...selectedAttendees, studentId]
    setSelectedAttendees(newAttendees)
    setValue('attendeeIds', newAttendees)
  }

  const handleFormSubmit = async (data: MeetingFormData) => {
    await onSubmit({ ...data, attendeeIds: selectedAttendees })
    if (!isEditMode) {
      reset()
      setSelectedAttendees([])
    }
  }

  const handleClose = () => {
    reset()
    setSelectedAttendees([])
    onClose()
  }

  return (
    <ModalDialog
      open={open}
      onOpenChange={handleClose}
      title={isEditMode ? t('meeting.editMeeting') : t('meeting.scheduleMeeting')}
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="scheduledDate">{t('meeting.scheduledDate')} *</Label>
          <Input
            id="scheduledDate"
            type="datetime-local"
            {...register('scheduledDate')}
            className={errors.scheduledDate ? 'border-destructive' : ''}
            min={new Date().toISOString().slice(0, 16)}
          />
          {errors.scheduledDate && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.scheduledDate.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration">{t('meeting.duration')} ({t('meeting.minutes')})</Label>
            <Input
              id="duration"
              type="number"
              {...register('duration', { valueAsNumber: true })}
              min={15}
              max={480}
              placeholder="60"
              className={errors.duration ? 'border-destructive' : ''}
            />
            {errors.duration && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.duration.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t('meeting.location')}</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder={t('meeting.locationPlaceholder')}
              className={errors.location ? 'border-destructive' : ''}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="agenda">{t('meeting.agenda')}</Label>
          <Textarea
            id="agenda"
            {...register('agenda')}
            placeholder={t('meeting.agendaPlaceholder')}
            rows={4}
            className={errors.agenda ? 'border-destructive' : ''}
          />
          {errors.agenda && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.agenda.message}
            </p>
          )}
        </div>

        {project?.students && project.students.length > 0 && (
          <div className="space-y-2">
            <Label>{t('meeting.attendees')}</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
              {project.students.map((student) => (
                <label
                  key={student.id}
                  className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedAttendees.includes(student.id)}
                    onChange={() => handleAttendeeToggle(student.id)}
                    className="rounded"
                  />
                  <span className="text-sm">{student.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('common.saving')}
              </>
            ) : (
              isEditMode ? t('common.update') : t('common.create')
            )}
          </Button>
        </div>
      </form>
    </ModalDialog>
  )
}
