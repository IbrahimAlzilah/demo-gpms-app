import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useProject } from '../../projects/hooks/useProjects'
import { useDocuments, DocumentUpload } from '@/pages/student/documents'
import { projectService } from '../../projects/api/project.service'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Textarea, Label, Badge } from '@/components/ui'
import { LoadingSpinner, StatusBadge } from '@/components/common'
import {
  Briefcase, User, Calendar, FileText, MessageSquare, CheckCircle2, Clock,
  MapPin, Users, TrendingUp, Loader2, Send, X, AlertCircle
} from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/lib/utils/format'

interface ProjectDashboardProps {
  projectId: string
}

export function ProjectDashboard({ projectId }: ProjectDashboardProps) {
  const { data: project, isLoading: projectLoading } = useProject(projectId)
  const { data: documents, isLoading: documentsLoading } = useDocuments(projectId)
  const [replyContent, setReplyContent] = useState<Record<string, string>>({})
  const [showReplyForm, setShowReplyForm] = useState<string | null>(null)

  const { data: notes, isLoading: notesLoading } = useQuery({
    queryKey: ['supervisor-notes', projectId],
    queryFn: () => projectService.getSupervisorNotes(projectId),
    enabled: !!projectId,
  })

  const { data: milestones, isLoading: milestonesLoading } = useQuery({
    queryKey: ['project-milestones', projectId],
    queryFn: () => projectService.getMilestones(projectId),
    enabled: !!projectId,
  })

  const { data: meetings, isLoading: meetingsLoading } = useQuery({
    queryKey: ['project-meetings', projectId],
    queryFn: () => projectService.getMeetings(projectId),
    enabled: !!projectId,
  })

  const { data: progressPercentage, isLoading: progressLoading } = useQuery({
    queryKey: ['project-progress', projectId],
    queryFn: () => projectService.getProgressPercentage(projectId),
    enabled: !!projectId,
  })

  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const replyToNote = useMutation({
    mutationFn: async ({ noteId, content }: { noteId: string; content: string }) => {
      // This would call an API endpoint to reply to a note
      return projectService.replyToNote(noteId, content)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supervisor-notes', projectId] })
    },
  })

  const handleReply = async (noteId: string) => {
    const content = replyContent[noteId]?.trim()
    if (!content) return

    try {
      await replyToNote.mutateAsync({ noteId, content })
      setReplyContent((prev) => ({ ...prev, [noteId]: '' }))
      setShowReplyForm(null)
    } catch (err) {
      console.error('Failed to reply to note:', err)
    }
  }

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>{t('followUp.projectNotFound')}</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Project Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 mb-2">
                <Briefcase className="h-6 w-6 text-primary" />
                {project.title}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {project.description}
              </CardDescription>
            </div>
            <StatusBadge status={project.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t('followUp.supervisor')}</p>
                <p className="text-sm font-medium">
                  {project.supervisor?.name || t('followUp.noSupervisor')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t('followUp.students')}</p>
                <p className="text-sm font-medium">
                  {project.currentStudents}/{project.maxStudents}
                </p>
              </div>
            </div>
          </div>

          {!progressLoading && progressPercentage !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {t('followUp.progress')}
                </span>
                <span className="text-lg font-bold">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supervisor Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            {t('followUp.supervisorNotes')}
          </CardTitle>
          <CardDescription>
            {t('followUp.supervisorNotesDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notesLoading ? (
            <LoadingSpinner />
          ) : notes && notes.length > 0 ? (
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="p-4 bg-info/10 border border-info/20 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-info" />
                        <p className="font-medium text-info">
                          {t('followUp.noteFromSupervisor')}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatRelativeTime(note.createdAt)}
                      </p>
                    </div>
                  </div>
                  <p className="text-foreground mb-3 whitespace-pre-wrap">{note.content}</p>

                  {note.studentReplies && note.studentReplies.length > 0 && (
                    <div className="mt-3 space-y-2 border-t pt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        {t('followUp.replies')}
                      </p>
                      {note.studentReplies.map((reply) => (
                        <div
                          key={reply.id}
                          className="p-3 bg-card rounded-lg border border-border"
                        >
                          <p className="text-sm text-foreground whitespace-pre-wrap">{reply.content}</p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatRelativeTime(reply.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {showReplyForm === note.id ? (
                    <div className="mt-3 space-y-2 border-t pt-3">
                      <Label htmlFor={`reply-${note.id}`}>
                        {t('followUp.replyToNote')}
                      </Label>
                      <Textarea
                        id={`reply-${note.id}`}
                        value={replyContent[note.id] || ''}
                        onChange={(e) =>
                          setReplyContent((prev) => ({ ...prev, [note.id]: e.target.value }))
                        }
                        placeholder={t('followUp.replyPlaceholder')}
                        rows={3}
                        className="resize-none"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleReply(note.id)}
                          disabled={!replyContent[note.id]?.trim() || replyToNote.isPending}
                        >
                          {replyToNote.isPending ? (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              {t('common.sending')}
                            </>
                          ) : (
                            <>
                              <Send className="mr-1 h-3 w-3" />
                              {t('common.send')}
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowReplyForm(null)
                            setReplyContent((prev) => ({ ...prev, [note.id]: '' }))
                          }}
                        >
                          <X className="mr-1 h-3 w-3" />
                          {t('common.cancel')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowReplyForm(note.id)}
                      className="mt-2"
                    >
                      <MessageSquare className="mr-1 h-3 w-3" />
                      {t('followUp.reply')}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              {t('followUp.noNotes')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {t('followUp.timeline')}
          </CardTitle>
          <CardDescription>
            {t('followUp.timelineDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {milestonesLoading || meetingsLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-6">
              {milestones && milestones.length > 0 ? (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {t('followUp.milestones')}
                  </h4>
                  <div className="space-y-3">
                    {milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className="p-4 bg-muted rounded-lg border border-border hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {milestone.completed ? (
                                <CheckCircle2 className="h-4 w-4 text-success" />
                              ) : (
                                <Clock className="h-4 w-4 text-warning" />
                              )}
                              <p className="font-medium">{milestone.title}</p>
                            </div>
                            {milestone.description && (
                              <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {t('followUp.dueDate')}: {formatDate(milestone.dueDate)}
                              </span>
                              {milestone.completed && milestone.completedAt && (
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  {t('followUp.completedAt')}: {formatDate(milestone.completedAt)}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant={milestone.completed ? 'default' : 'secondary'}
                            className={milestone.completed ? 'bg-success/10 text-success' : ''}
                          >
                            {milestone.completed
                              ? (t('followUp.completed'))
                              : (t('followUp.inProgress'))
                            }
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  {t('followUp.noMilestones')}
                </p>
              )}

              {meetings && meetings.length > 0 && (
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {t('followUp.meetings')}
                  </h4>
                  <div className="space-y-3">
                    {meetings.map((meeting) => (
                      <div
                        key={meeting.id}
                        className="p-4 bg-info/10 rounded-lg border border-info/20"
                      >
                        <p className="font-medium mb-2">
                          {meeting.agenda || t('followUp.meetingWithSupervisor')}
                        </p>
                        <div className="grid gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {t('followUp.date')}: {formatDate(meeting.scheduledDate)}
                            </span>
                          </div>
                          {meeting.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {t('followUp.location')}: {meeting.location}
                              </span>
                            </div>
                          )}
                          {meeting.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {t('followUp.duration')}: {meeting.duration} {t('followUp.minutes')}
                              </span>
                            </div>
                          )}
                        </div>
                        {meeting.notes && (
                          <div className="mt-2 p-2 bg-card rounded border border-border">
                            <p className="text-xs font-medium mb-1">{t('followUp.notes')}</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{meeting.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Submission */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {t('followUp.documentSubmission')}
          </CardTitle>
          <CardDescription>
            {t('followUp.documentSubmissionDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentUpload projectId={projectId} />
        </CardContent>
      </Card>

      {/* Submitted Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {t('followUp.submittedDocuments')}
          </CardTitle>
          <CardDescription>
            {t('followUp.submittedDocumentsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documentsLoading ? (
            <LoadingSpinner />
          ) : documents && documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg border hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.fileName}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>{doc.type}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(doc.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={`reviewStatus_${doc.reviewStatus}`} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              {t('followUp.noDocuments')}
            </p>
          )}
        </CardContent>
      </Card>
    </>
  )
}
