import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useProjectGrades } from '../hooks/useEvaluation'
import { projectService } from '../../student/api/project.service'
import { Card, CardContent, CardHeader, CardTitle, Button, Label, Textarea } from '@/components/ui'
import { LoadingSpinner, useToast } from '@/components/common'
import { MessageSquare, Award, Loader2 } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'

interface ProjectProgressTrackerProps {
  projectId: string
}

export function ProjectProgressTracker({ projectId }: ProjectProgressTrackerProps) {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const [notes, setNotes] = useState('')
  const { data: grades, isLoading } = useProjectGrades(projectId)

  const { data: supervisorNotes, isLoading: notesLoading } = useQuery({
    queryKey: ['supervisor-notes', projectId],
    queryFn: () => projectService.getSupervisorNotes(projectId),
    enabled: !!projectId,
  })

  const queryClient = useQueryClient()

  const saveNote = useMutation({
    mutationFn: async (content: string) => {
      return projectService.addSupervisorNote(projectId, content)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supervisor-notes', projectId] })
      showToast(t('supervisor.noteSaved'), 'success')
      setNotes('')
    },
    onError: () => {
      showToast(t('supervisor.noteError'), 'error')
    },
  })

  const handleSaveNote = async () => {
    if (!notes.trim()) {
      showToast(t('supervisor.noteRequired'), 'warning')
      return
    }
    await saveNote.mutateAsync(notes.trim())
  }

  if (isLoading || notesLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            {t('supervisor.addNotes')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">{t('supervisor.notes')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('supervisor.notesPlaceholder')}
              rows={4}
            />
          </div>
          <Button
            onClick={handleSaveNote}
            disabled={saveNote.isPending || !notes.trim()}
          >
            {saveNote.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('common.saving')}
              </>
            ) : (
              t('common.save')
            )}
          </Button>
        </CardContent>
      </Card>

      {supervisorNotes && supervisorNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              {t('supervisor.previousNotes')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {supervisorNotes.map((note) => (
                <div key={note.id} className="p-4 bg-muted rounded-lg border">
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatRelativeTime(note.createdAt)}
                  </p>
                  {note.studentReplies && note.studentReplies.length > 0 && (
                    <div className="mt-3 space-y-2 border-t pt-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        {t('supervisor.studentReplies')}
                      </p>
                      {note.studentReplies.map((reply) => (
                        <div key={reply.id} className="p-2 bg-card rounded border">
                          <p className="text-sm">{reply.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatRelativeTime(reply.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {grades && grades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              {t('supervisor.evaluations')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {grades.map((grade) => (
                <div key={grade.id} className="p-4 bg-muted rounded-lg border">
                  <p className="font-medium">
                    {t('supervisor.grade')}: {grade.supervisorGrade?.score || t('common.notSet')} /{' '}
                    {grade.supervisorGrade?.maxScore || 100}
                  </p>
                  {grade.supervisorGrade?.comments && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {grade.supervisorGrade.comments}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

