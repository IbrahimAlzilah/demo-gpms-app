import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { LoadingSpinner, ConfirmDialog, useToast } from '@/components/common'
import { Calendar, Edit, Trash2, Plus, Users, MapPin, Clock } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import { meetingService } from '../api/meeting.service'
import { MeetingForm } from './MeetingForm'
import {
  useCreateMeeting,
  useUpdateMeeting,
  useDeleteMeeting,
} from '../hooks/useMeetingOperations'
import type { ProjectMeeting, Project } from '@/types/project.types'
import type { MeetingFormData } from '../types/meeting.types'

interface MeetingsManagerProps {
  projectId: string
  project?: Project | null
}

export function MeetingsManager({ projectId, project }: MeetingsManagerProps) {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<ProjectMeeting | null>(null)
  const [deletingMeeting, setDeletingMeeting] = useState<ProjectMeeting | null>(null)

  const { data: meetings, isLoading } = useQuery({
    queryKey: ['project-meetings', projectId],
    queryFn: () => meetingService.getAll(projectId),
    enabled: !!projectId,
  })

  const createMeeting = useCreateMeeting(projectId)
  const updateMeeting = useUpdateMeeting(projectId)
  const deleteMeeting = useDeleteMeeting(projectId)

  const handleCreate = async (data: MeetingFormData) => {
    try {
      await createMeeting.mutateAsync({
        scheduled_date: data.scheduledDate,
        duration: data.duration,
        location: data.location,
        agenda: data.agenda,
        attendee_ids: data.attendeeIds,
      })
      showToast(t('meeting.createSuccess'), 'success')
      setShowForm(false)
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t('meeting.createError'),
        'error'
      )
    }
  }

  const handleUpdate = async (data: MeetingFormData) => {
    if (!editingMeeting) return
    try {
      await updateMeeting.mutateAsync({
        meetingId: editingMeeting.id,
        data: {
          scheduled_date: data.scheduledDate,
          duration: data.duration,
          location: data.location,
          agenda: data.agenda,
          attendee_ids: data.attendeeIds,
        },
      })
      showToast(t('meeting.updateSuccess'), 'success')
      setEditingMeeting(null)
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t('meeting.updateError'),
        'error'
      )
    }
  }

  const handleDelete = async () => {
    if (!deletingMeeting) return
    try {
      await deleteMeeting.mutateAsync(deletingMeeting.id)
      showToast(t('meeting.deleteSuccess'), 'success')
      setDeletingMeeting(null)
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t('meeting.deleteError'),
        'error'
      )
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {t('meeting.management')}
            </CardTitle>
            <Button
              size="sm"
              onClick={() => {
                setEditingMeeting(null)
                setShowForm(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('meeting.scheduleMeeting')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {meetings && meetings.length > 0 ? (
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-4 rounded-lg border bg-card border-border"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold">
                          {formatDate(meeting.scheduledDate)}
                        </h4>
                      </div>
                      {meeting.agenda && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {meeting.agenda}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {meeting.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{meeting.duration} {t('meeting.minutes')}</span>
                          </div>
                        )}
                        {meeting.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{meeting.location}</span>
                          </div>
                        )}
                        {meeting.attendees && meeting.attendees.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{meeting.attendees.length} {t('meeting.attendees')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingMeeting(meeting)
                          setShowForm(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeletingMeeting(meeting)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              {t('meeting.noMeetings')}
            </p>
          )}
        </CardContent>
      </Card>

      <MeetingForm
        open={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingMeeting(null)
        }}
        onSubmit={editingMeeting ? handleUpdate : handleCreate}
        meeting={editingMeeting}
        project={project}
        isPending={createMeeting.isPending || updateMeeting.isPending}
      />

      <ConfirmDialog
        open={!!deletingMeeting}
        onOpenChange={(open) => !open && setDeletingMeeting(null)}
        title={t('meeting.deleteTitle')}
        description={t('meeting.deleteDescription')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </>
  )
}
