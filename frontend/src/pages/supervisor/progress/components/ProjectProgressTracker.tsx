import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useProjectGrades } from '@/pages/supervisor/evaluation/hooks/useEvaluation'
import { projectService } from '@/pages/supervisor/projects/api/project.service'
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
      setNotes('')
      showToast({
        title: t('common.success'),
        description: t('supervisor.noteSaved'),
        variant: 'default',
      })
    },
    onError: () => {
      showToast({
        title: t('common.error'),
        description: t('supervisor.failedToSaveNote'),
        variant: 'destructive',
      })
    },
  })

  if (isLoading || notesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Grades Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            {t('supervisor.studentGrades')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {grades && grades.length > 0 ? (
            <div className="space-y-3">
              {grades.map((grade) => (
                <div
                  key={grade.id}
                  className="flex items-start justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">
                        {grade.student?.name || t('supervisor.student')}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatRelativeTime(grade.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold">
                        {grade.score} / {grade.maxScore}
                      </span>
                      {grade.comments && (
                        <p className="text-sm text-muted-foreground">{grade.comments}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              {t('supervisor.noGrades')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            {t('supervisor.supervisorNotes')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Note Form */}
          <div className="space-y-2">
            <Label htmlFor="note">{t('supervisor.addNote')}</Label>
            <Textarea
              id="note"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('supervisor.notePlaceholder')}
              rows={3}
              className="resize-none"
            />
            <Button
              onClick={() => {
                if (notes.trim()) {
                  saveNote.mutate(notes.trim())
                }
              }}
              disabled={!notes.trim() || saveNote.isPending}
              size="sm"
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
          </div>

          {/* Existing Notes */}
          {supervisorNotes && supervisorNotes.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <h4 className="font-medium">{t('supervisor.previousNotes')}</h4>
              {supervisorNotes.map((note: any) => (
                <div
                  key={note.id}
                  className="rounded-lg border p-3 bg-muted/50"
                >
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatRelativeTime(note.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
