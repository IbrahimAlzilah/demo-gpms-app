import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useRegisterProject,
  useProjectRegistration,
  useCancelRegistration,
} from '../../hooks/useProjectOperations'
import { useStudentRegistrations } from '../../hooks/useProjects'
import { usePeriodCheck } from '@/hooks/usePeriodCheck'
import { useMyGroup } from '@/pages/student/groups/hooks/useGroups'
import { useAuthStore } from '@/pages/auth/login'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Button } from '@/components/ui'
import { LoadingSpinner, useToast } from '@/components/common'
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  User,
  Users,
  Loader2,
} from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import type { Project } from '@/types/project.types'

interface ProjectRegistrationFormProps {
  project: Project
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProjectRegistrationForm({
  project,
  onSuccess,
  onCancel,
}: ProjectRegistrationFormProps) {
  const { t } = useTranslation()
  const registerProject = useRegisterProject()
  const cancelRegistration = useCancelRegistration()
  const { data: registration, isLoading: registrationLoading } = useProjectRegistration(project.id)
  const { data: allRegistrations } = useStudentRegistrations()
  const { isPeriodActive, isLoading: periodLoading } = usePeriodCheck('project_registration')
  const { data: studentGroup, isLoading: groupLoading } = useMyGroup()
  const { user } = useAuthStore()
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  const { toastSuccess, toastError } = useToast()

  // Check if user is group leader
  const isGroupLeader = studentGroup?.leaderId === user?.id

  // Update selectedGroupId when studentGroup loads
  useEffect(() => {
    if (studentGroup?.id) {
      setSelectedGroupId(studentGroup.id)
    }
  }, [studentGroup?.id])

  // Check if there's a rejected registration for another project
  const rejectedRegistrationForOtherProject = allRegistrations?.find(
    (reg) => reg.status === 'rejected' && reg.projectId !== project.id
  )

  // Check if there's an approved registration for any project (blocks new registrations)
  const approvedRegistration = allRegistrations?.find(
    (reg) => reg.status === 'approved'
  )

  // Check if project is assigned to another group (different from current student's group)
  const isAssignedToAnotherGroup = project.assignedGroupId &&
    project.assignedGroupId !== studentGroup?.id &&
    project.assignedGroup

  const handleSubmit = async () => {
    if (!isPeriodActive) {
      toastError(t('project.periodClosed'))
      return
    }

    if (!selectedGroupId) {
      toastError(t('project.selectGroupRequired'))
      return
    }

    if (project.currentStudents >= project.maxStudents) {
      toastError(t('project.fullCapacity'))
      return
    }

    try {
      await registerProject.mutateAsync({ projectId: project.id, studentGroupId: selectedGroupId })
      toastSuccess('project.registrationSuccess')
      setTimeout(() => {
        onSuccess?.()
      }, 2000)
    } catch (err: any) {
      // Extract error message from API response
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t('project.registrationError')
      toastError(errorMessage)
    }
  }

  const handleCancelRegistration = async () => {
    if (!registration) return
    try {
      await cancelRegistration.mutateAsync(registration.id)
      onSuccess?.()
    } catch (err: any) {
      // Extract error message from API response
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t('project.cancelRegistrationError')
      toastError(errorMessage)
    }
  }

  if (registrationLoading || periodLoading || groupLoading) {
    return (
      <Card className="shadow-none border-none p-2">
        <CardContent className="pt-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  // If there's a pending registration, show status
  if (registration && registration.status === 'pending') {
    return (
      <Card className="shadow-none border-none p-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning" />
            {t('project.registrationStatus')}
          </CardTitle>
          <CardDescription>
            {t('project.registrationPending')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div>
            <h4 className="font-semibold mb-2">{project.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          </div>

          {/* Pending Status Card */}
          <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <Clock className="h-5 w-5 text-warning mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-warning font-semibold mb-2">
                ⏰ {t('project.registrationPending')}
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                {t('project.registrationPendingDescription')}
              </p>

              {/* What you can do */}
              <div className="space-y-2 mb-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  {t('project.whatYouCanDo')}:
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
                  <li>{t('project.canTrackStatus')}</li>
                  <li>{t('project.canCancelRegistration')}</li>
                  <li className="text-destructive">{t('project.cannotRegisterAnother')}</li>
                </ul>
              </div>

              <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground pt-3 border-t border-warning/20">
                <Calendar className="h-3 w-3" />
                <span>
                  {t('project.submittedAt')}: {formatDate(registration.submittedAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Error block removed */}

          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={handleCancelRegistration}
              disabled={cancelRegistration.isPending}
              variant="outline"
              className="flex-1"
            >
              {cancelRegistration.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('project.cancelling')}
                </>
              ) : (
                <>
                  <XCircle className="size-4" />
                  {t('project.cancelRegistration')}
                </>
              )}
            </Button>
            {onCancel && (
              <Button onClick={onCancel} variant="outline">
                {t('common.back')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // If registration was approved
  if (registration && registration.status === 'approved') {
    return (
      <Card className="shadow-none border-none p-2">
        <CardHeader className='px-0'>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            {t('project.registrationStatus')}
          </CardTitle>
          <CardDescription>
            {t('project.registrationApproved')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div>
            <h4 className="font-semibold mb-2">{project.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          </div>

          {/* Approved Status Card */}
          <div className="flex items-start gap-3 p-4 bg-success/10 border border-success/20 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-success font-semibold mb-2">
                ✅ {t('project.registrationApproved')}
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                {t('project.registrationApprovedDescription')}
              </p>

              {/* What you can do after approval */}
              <div className="space-y-2 mb-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  {t('project.whatYouCanDoAfterApproval')}:
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
                  <li>{t('project.canManageGroup')}</li>
                  <li>{t('project.canUploadDocuments')}</li>
                  <li>{t('project.canViewSupervisorNotes')}</li>
                  <li>{t('project.canViewMilestones')}</li>
                  <li>{t('project.canTrackProgress')}</li>
                </ul>
              </div>

              {registration.reviewedAt && (
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground pt-3 border-t border-success/20">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {t('project.approvedAt')}: {formatDate(registration.reviewedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {onCancel && (
            <Button onClick={onCancel} variant="outline" className="w-full">
              {t('common.back')}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  // If registration was rejected - allow registering in another project
  if (registration && registration.status === 'rejected') {
    // Only show rejection status if this is the same project that was rejected
    if (registration.projectId === project.id) {
      return (
        <Card className="shadow-none border-none p-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              {t('project.registrationStatus')}
            </CardTitle>
            <CardDescription>
              {t('project.registrationRejected')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-0">
            <div>
              <h4 className="font-semibold mb-2">{project.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
            </div>

            {/* Rejected Status Card */}
            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-destructive font-semibold mb-2">
                  ❌ {t('project.registrationRejected')}
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  {t('project.registrationRejectedDescription')}
                </p>

                {/* Review Comments */}
                {registration.reviewComments ? (
                  <div className="mb-3 p-4 bg-background rounded-lg border-2 border-destructive/30 shadow-sm">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-destructive mb-1">
                          {t('project.rejectionComments')}
                        </p>
                        <p className="text-xs text-muted-foreground mb-2">
                          {t('project.rejectionCommentsDescription')}
                        </p>
                      </div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-md border border-destructive/20">
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {registration.reviewComments}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3 p-3 bg-muted/30 rounded-md border border-muted">
                    <p className="text-xs text-muted-foreground">
                      {t('project.noRejectionComments')}
                    </p>
                  </div>
                )}

                {/* Cannot re-register message */}
                <div className="mb-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive font-semibold mb-1">
                    {t('project.cannotReRegisterRejected')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('project.cannotReRegisterRejectedDescription')}
                  </p>
                </div>

                {/* What you can do */}
                <div className="space-y-2 mb-3 p-3 bg-info/10 rounded-md border border-info/20">
                  <p className="text-xs font-semibold text-info mb-2">
                    {t('project.whatYouCanDo')}:
                  </p>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                      <span>{t('project.canRegisterInDifferentProject')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                      <span>{t('project.canReviewComments')}</span>
                    </li>
                    {registration.reviewComments && (
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                        <span>{t('project.useCommentsToImprove')}</span>
                      </li>
                    )}
                  </ul>
                </div>

                {registration.reviewedAt && (
                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground pt-3 border-t border-destructive/20">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {t('project.rejectedAt')}: {formatDate(registration.reviewedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              {onCancel && (
                <Button onClick={onCancel} variant="outline" className="flex-1">
                  {t('common.back')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )
    }
    // If rejected registration is for a different project, allow registration in this project
    // Fall through to registration form below
  }

  // If registration was cancelled
  if (registration && registration.status === 'cancelled') {
    return (
      <Card className="shadow-none border-none p-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-muted-foreground" />
            {t('project.registrationStatus')}
          </CardTitle>
          <CardDescription>
            {t('project.registrationCancelled')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div>
            <h4 className="font-semibold mb-2">{project.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          </div>

          {/* Cancelled Status Card */}
          <div className="flex items-start gap-3 p-4 bg-muted/50 border border-muted rounded-lg">
            <XCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-muted-foreground font-semibold mb-2">
                🚫 {t('project.registrationCancelled')}
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                {t('project.registrationCancelledDescription')}
              </p>

              {/* What you can do */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  {t('project.whatYouCanDo')}:
                </p>
                <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
                  <li>{t('project.canRegisterNew')}</li>
                </ul>
              </div>
            </div>
          </div>

          {onCancel && (
            <Button onClick={onCancel} variant="outline" className="w-full">
              {t('common.back')}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  // If there's an approved registration for another project, block registration
  if (approvedRegistration && approvedRegistration.projectId !== project.id) {
    return (
      <Card className="shadow-none border-none p-2">
        <CardHeader className='px-0'>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            {t('project.registrationStatus')}
          </CardTitle>
          <CardDescription>
            {t('project.alreadyRegistered')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div>
            <h4 className="font-semibold mb-2">{project.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          </div>

          {/* Approved Registration Blocking Message */}
          <div className="flex items-start gap-3 p-4 bg-success/10 border border-success/20 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-success font-semibold mb-2">
                {t('project.alreadyRegisteredInProject')}
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                {t('project.alreadyRegisteredDescription')}
              </p>

              {approvedRegistration.project && (
                <div className="mt-3 p-3 bg-background rounded-lg border border-success/30">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {t('project.approvedProject')}:
                  </p>
                  <p className="text-sm font-semibold">
                    {approvedRegistration.project.title}
                  </p>
                  {approvedRegistration.reviewedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('project.approvedAt')}: {formatDate(approvedRegistration.reviewedAt)}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-3 p-3 bg-warning/10 border border-warning/20 rounded-md">
                <p className="text-xs text-warning font-semibold mb-1">
                  {t('project.cannotRegisterAnother')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('project.cannotRegisterAnotherDescription')}
                </p>
              </div>
            </div>
          </div>

          {onCancel && (
            <Button onClick={onCancel} variant="outline" className="w-full">
              {t('common.back')}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-none border-none p-2">
      <CardHeader className='px-0'>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          {t('project.registerInProject')}
        </CardTitle>
        <CardDescription>
          {t('project.registerDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        <div>
          <h4 className="font-semibold mb-2">{project.title}</h4>
          <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">{t('project.supervisor')}</p>
              <p className="text-sm font-medium">
                {project.supervisor?.name || t('project.noSupervisor')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">
                {t('project.students')}
              </p>
              <p className="text-sm font-medium">
                {project.currentStudents}/{project.maxStudents}
                {project.currentStudents >= project.maxStudents && (
                  <span className="text-xs text-destructive ms-2">
                    ({t('project.full')})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Leader Check */}
        {studentGroup && !isGroupLeader && (
          <div className="flex items-start gap-2 p-3 text-sm text-warning bg-warning/10 border border-warning/20 rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium mb-1">{t('registration.onlyLeaderCanRegister')}</p>
              <p className="text-xs text-muted-foreground">
                {t('registration.onlyLeaderCanRegisterDescription')}
              </p>
            </div>
          </div>
        )}

        {/* Group Selection */}
        {!studentGroup ? (
          <div className="flex items-start gap-2 p-3 text-sm text-warning bg-warning/10 border border-warning/20 rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium mb-1">{t('project.noGroupRequired')}</p>
              <p className="text-xs text-muted-foreground">
                {t('project.createGroupFirst')}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('project.selectGroup')}</label>
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger>
                <SelectValue placeholder={t('project.selectGroupPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={studentGroup.id}>
                  {studentGroup.name || `${t('project.group')} #${studentGroup.id}`}
                  {' '}
                  ({studentGroup.memberCount}/{studentGroup.maxMembers} {t('project.members')})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Warning if project is assigned to another group */}
        {isAssignedToAnotherGroup && (
          <div className="flex items-start gap-3 p-4 text-sm bg-warning/10 border border-warning/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-warning mb-2">
                {t('project.projectAssignedToAnotherGroup')}
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                {t('project.projectAssignedToAnotherGroupDescription')}
              </p>

              {/* Assigned Group Details */}
              {project.assignedGroup && (
                <div className="mt-3 p-3 bg-background rounded-lg border border-warning/30">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    {t('project.assignedGroupDetails')}:
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-sm font-semibold">
                        {project.assignedGroup.name || project.assignedGroup.groupCode || t('project.group')} #{project.assignedGroup.id}
                      </p>
                    </div>
                    {project.assignedGroup.leader && (
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {t('project.groupLeader')}: <span className="font-medium">{project.assignedGroup.leader.name || project.assignedGroup.leader.email}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-3 p-3 bg-info/10 border border-info/20 rounded-md">
                <p className="text-xs text-info font-semibold mb-1">
                  {t('project.canStillRegister')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('project.canStillRegisterDescription')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Show info if there's a rejected registration for another project */}
        {rejectedRegistrationForOtherProject && (
          <div className="flex items-start gap-2 p-3 text-sm text-info bg-info/10 border border-info/20 rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium mb-1">{t('project.previousRejectionInfo')}</p>
              <p className="text-xs text-muted-foreground">
                {t('project.canRegisterInNewProject')}
              </p>
            </div>
          </div>
        )}

        {!isPeriodActive && (
          <div className="flex items-start gap-2 p-3 text-sm text-warning bg-warning/10 border border-warning/20 rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{t('project.periodClosed')}</span>
          </div>
        )}



        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={handleSubmit}
            disabled={
              registerProject.isPending ||
              !isPeriodActive ||
              !studentGroup ||
              !isGroupLeader ||
              !selectedGroupId ||
              project.currentStudents >= project.maxStudents ||
              !!approvedRegistration
            }
            className="flex-1"
          >
            {registerProject.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('project.registering')}
              </>
            ) : (
              t('project.confirmRegistration')
            )}
          </Button>
          {onCancel && (
            <Button onClick={onCancel} variant="outline">
              {t('common.cancel')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
