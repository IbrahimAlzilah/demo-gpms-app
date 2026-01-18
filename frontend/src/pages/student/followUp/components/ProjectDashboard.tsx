import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useProject } from '../../projects/hooks/useProjects'
import { useDocuments, DocumentUpload } from '@/pages/student/documents'
import { projectService } from '../../projects/api/project.service'
import { Button, Textarea, Label, Badge } from '@/components/ui'
import { LoadingSpinner, StatusBadge, ModalDialog, BlockContent } from '@/components/common'
import {
  Calendar, FileText, MessageSquare, CheckCircle2, Clock, Loader2, Send, X, AlertCircle, Upload
} from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/lib/utils/format'
import type { NoteReply } from '@/types/project.types'

interface ProjectDashboardProps {
  projectId: string
}

export function ProjectDashboard({ projectId }: ProjectDashboardProps) {
  const { data: project, isLoading: projectLoading } = useProject(projectId)
  const { data: documents, isLoading: documentsLoading } = useDocuments(projectId)
  const [replyContent, setReplyContent] = useState<Record<string, string>>({})
  const [showReplyModal, setShowReplyModal] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)

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
      return projectService.replyToNote(projectId, noteId, content)
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
      setShowReplyModal(null)
    } catch (err) {
      console.error('Failed to reply to note:', err)
    }
  }

  const handleUploadSuccess = () => {
    setShowUploadModal(false)
    queryClient.invalidateQueries({ queryKey: ['documents', projectId] })
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

  // Get the next upcoming meeting
  const upcomingMeeting = meetings?.find(m => new Date(m.scheduledDate) >= new Date())

  return (
    <>
      {/* Main Unified Card */}
      <BlockContent title={t('nav.followUp')}>
        {/* Project Header Section */}
        <div className="px-6 pb-6 border-b">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            {/* Project Info - Left Side */}
            <div className="space-y-3 flex-1">
              <div>
                <p className="text-sm text-muted-foreground">{t('followUp.projectName')}:</p>
                <p className="text-lg font-semibold text-foreground">{project.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('followUp.supervisor')}:</p>
                <p className="font-medium text-foreground">
                  {project.supervisor?.name || t('followUp.noSupervisor')}
                </p>
              </div>
            </div>

            {/* Status & Progress - Right Side */}
            <div className="space-y-3 md:text-end md:min-w-[200px]">
              <div>
                <p className="text-sm text-muted-foreground">{t('common.status')}:</p>
                <StatusBadge status={project.status} />
              </div>
              {!progressLoading && progressPercentage !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('followUp.completionRate')}:</p>
                  <p className="text-lg font-bold text-foreground">{progressPercentage}%</p>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {!progressLoading && progressPercentage !== undefined && (
            <div className="mt-4">
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-primary/70 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Supervisor Notes Section */}
        <div className="px-6 py-5 border-b bg-amber-50/50 dark:bg-amber-950/10">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            <h2 className="font-semibold text-foreground">{t('followUp.supervisorNotes')}</h2>
          </div>

          {notesLoading ? (
            <LoadingSpinner />
          ) : notes && notes.length > 0 ? (
            <div className="space-y-4">
              {notes.slice(0, 3).map((note) => (
                <div key={note.id} className="bg-white dark:bg-card rounded-lg border p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm text-foreground whitespace-pre-wrap flex-1">{note.content}</p>
                    <span className="text-xs text-muted-foreground shrink-0 ms-4">
                      {formatDate(note.createdAt)}
                    </span>
                  </div>

                  {note.studentReplies && note.studentReplies.length > 0 && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      {note.studentReplies.map((reply: NoteReply) => (
                        <div
                          key={reply.id}
                          className="ps-4 border-s-2 border-primary/30"
                        >
                          <p className="text-sm text-muted-foreground">{reply.content}</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            {formatRelativeTime(reply.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowReplyModal(note.id)}
                    className="mt-2 h-7 text-xs"
                  >
                    <MessageSquare className="me-1 h-3 w-3" />
                    {t('followUp.reply')}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('followUp.noNotes')}
            </p>
          )}
        </div>

        {/* Timeline Section */}
        <div className="px-6 py-5 border-b">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">{t('followUp.timeline')}</h2>
          </div>

          {milestonesLoading || meetingsLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-4">
              {/* Upcoming Meeting */}
              {upcomingMeeting && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200/50 dark:border-amber-800/30">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg shrink-0">
                    <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t('followUp.upcomingMeeting')}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(upcomingMeeting.scheduledDate)}
                    </p>
                  </div>
                </div>
              )}

              {/* Milestones */}
              {milestones && milestones.length > 0 ? (
                <div className="space-y-2">
                  {milestones.slice(0, 3).map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      {milestone.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-500 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{milestone.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('followUp.dueDate')}: {formatDate(milestone.dueDate)}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={milestone.completed
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }
                      >
                        {milestone.completed ? t('followUp.completed') : t('followUp.inProgress')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : !upcomingMeeting && (
                <p className="text-sm text-muted-foreground">
                  {t('followUp.noMilestones')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Documents Section */}
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">{t('followUp.submittedDocuments')}</h2>
            </div>
            <Button
              size="sm"
              onClick={() => setShowUploadModal(true)}
            >
              <Upload className="me-2 h-4 w-4" />
              {t('followUp.uploadNewDocument')}
            </Button>
          </div>

          {documentsLoading ? (
            <LoadingSpinner />
          ) : documents && documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.type} • {formatRelativeTime(doc.createdAt)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={`reviewStatus_${doc.reviewStatus}`} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('followUp.noDocuments')}
            </p>
          )}
        </div>
      </BlockContent>

      {/* Document Upload Modal */}
      <ModalDialog
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        title={t('followUp.uploadNewDocument')}
        description={t('followUp.documentSubmissionDescription')}
        size="lg"
      >
        <DocumentUpload projectId={projectId} onSuccess={handleUploadSuccess} />
      </ModalDialog>

      {/* Reply to Note Modal */}
      {showReplyModal && (
        <ModalDialog
          open={!!showReplyModal}
          onOpenChange={(open) => {
            if (!open) {
              setShowReplyModal(null)
              const noteId = showReplyModal
              setReplyContent((prev) => ({ ...prev, [noteId]: '' }))
            }
          }}
          title={t('followUp.replyToNote')}
          description={t('followUp.replyPlaceholder')}
          size="md"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reply-content">
                {t('followUp.reply')} <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="reply-content"
                value={replyContent[showReplyModal] || ''}
                onChange={(e) =>
                  setReplyContent((prev) => ({ ...prev, [showReplyModal]: e.target.value }))
                }
                placeholder={t('followUp.replyPlaceholder')}
                rows={5}
                className="resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const noteId = showReplyModal
                  setShowReplyModal(null)
                  setReplyContent((prev) => ({ ...prev, [noteId]: '' }))
                }}
              >
                <X className="me-2 h-4 w-4" />
                {t('common.cancel')}
              </Button>
              <Button
                onClick={() => handleReply(showReplyModal)}
                disabled={!replyContent[showReplyModal]?.trim() || replyToNote.isPending}
              >
                {replyToNote.isPending ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {t('common.sending')}
                  </>
                ) : (
                  <>
                    <Send className="me-2 h-4 w-4" />
                    {t('common.send')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </ModalDialog>
      )}
    </>
  )
}
