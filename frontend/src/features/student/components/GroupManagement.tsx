import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useMyGroup,
  useRemoveGroupMember,
  useInviteGroupMember,
  useGroupInvitations,
  useAcceptInvitation,
  useRejectInvitation,
  useJoinGroup,
  useCreateGroup,
} from '../hooks/useGroups'
import { useProjectRegistration, useStudentRegistrations } from '../hooks/useProjects'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { BlockContent } from '../../../components/common/BlockContent'
import { ModalDialog } from '../../../components/common/ModalDialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { useAuthStore } from '../../auth/store/auth.store'
import { AlertCircle, Users, UserPlus, UserMinus, Mail, Crown, Loader2, CheckCircle2, XCircle, Plus, ArrowLeft } from 'lucide-react'
import { formatRelativeTime } from '../../../lib/utils/format'
import { groupInviteSchema, groupJoinSchema, type GroupInviteSchema, type GroupJoinSchema } from '../schema'

export function GroupManagement() {
  const { t } = useTranslation()
  const { data: group, isLoading } = useMyGroup()
  const { data: invitations, isLoading: invitationsLoading } = useGroupInvitations()
  const { user } = useAuthStore()
  const removeMember = useRemoveGroupMember()
  const inviteMember = useInviteGroupMember()
  const acceptInvitation = useAcceptInvitation()
  const rejectInvitation = useRejectInvitation()
  const joinGroup = useJoinGroup()
  const createGroup = useCreateGroup()
  // Check if student has approved registration for this project (hook must be called before conditional returns)
  const { data: registration } = useProjectRegistration(group?.projectId || '')
  const { data: registrations } = useStudentRegistrations()

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const [showJoinGroupModal, setShowJoinGroupModal] = useState(false)

  // Invite form
  const {
    register: registerInvite,
    handleSubmit: handleInviteSubmit,
    formState: { errors: inviteErrors },
    reset: resetInvite,
  } = useForm<GroupInviteSchema>({
    resolver: zodResolver(groupInviteSchema(t)),
    defaultValues: {
      inviteeId: '',
      message: '',
    },
  })

  // Join form
  const {
    register: registerJoin,
    handleSubmit: handleJoinSubmit,
    formState: { errors: joinErrors },
    reset: resetJoin,
  } = useForm<GroupJoinSchema>({
    resolver: zodResolver(groupJoinSchema(t)),
    defaultValues: {
      joinGroupId: '',
    },
  })

  const handleInvite = async (data: GroupInviteSchema) => {
    if (!group) {
      setError(t('groups.validation.groupRequired'))
      return
    }

    if (group.members.length >= group.maxMembers) {
      setError(t('groups.fullCapacity'))
      return
    }

    setError('')
    setSuccess('')
    try {
      await inviteMember.mutateAsync({
        groupId: group.id,
        inviteeId: data.inviteeId,
        message: data.message?.trim() || undefined,
      })
      resetInvite()
      setShowInviteForm(false)
      setSuccess(t('groups.inviteSuccess'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('groups.inviteError'))
    }
  }

  const handleJoin = async (data: GroupJoinSchema) => {
    setError('')
    setSuccess('')
    try {
      await joinGroup.mutateAsync(data.joinGroupId)
      resetJoin()
      setShowJoinGroupModal(false)
      setSuccess(t('groups.joinSuccess'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('groups.joinError'))
    }
  }

  const handleCreateGroup = async () => {
    // Find approved registration
    const approvedRegistration = registrations?.find(r => r.status === 'approved')

    if (!approvedRegistration) {
      setError(t('groups.needProjectFirst'))
      setShowCreateGroupModal(false)
      return
    }

    setError('')
    setSuccess('')
    try {
      await createGroup.mutateAsync({
        projectId: approvedRegistration.projectId,
        members: [], // Start with empty members, can invite later
      })
      setShowCreateGroupModal(false)
      setSuccess(t('groups.createSuccess') || 'تم إنشاء المجموعة بنجاح')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('groups.createError') || 'فشل إنشاء المجموعة')
    }
  }

  if (isLoading || invitationsLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (!group) {
    const headerActions = (
      <div className="flex items-center gap-3">
        <Button
          onClick={() => {
            setShowCreateGroupModal(true)
            setError('')
          }}
          className="bg-primary text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 ml-2" />
          {t('groups.createGroup')}
        </Button>
        <Button
          onClick={() => {
            setShowJoinGroupModal(true)
            setError('')
          }}
          variant="outline"
          className="border-gray-300 text-primary hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 ml-2" />
          {t('groups.joinGroup')}
        </Button>
      </div>
    )

    return (
      <>
        <BlockContent
          title={t('groups.management')}
          actions={headerActions}
          className="bg-white"
        >
          <div className="space-y-6">
            {success && (
              <div className="flex items-start gap-2 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {invitations && invitations.length > 0 && (
              <div className="mb-6 space-y-3">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium mb-1 text-gray-800">
                        {t('groups.invitationFrom')}
                      </p>
                      {invitation.inviter && (
                        <p className="text-sm text-gray-600 mb-2">
                          {t('groups.from')}: {invitation.inviter.name}
                        </p>
                      )}
                      {invitation.message && (
                        <p className="text-sm text-gray-600 mb-2">{invitation.message}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {formatRelativeTime(invitation.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => acceptInvitation.mutate(invitation.id)}
                        disabled={acceptInvitation.isPending || rejectInvitation.isPending}
                      >
                        {acceptInvitation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            {t('common.accept')}
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectInvitation.mutate(invitation.id)}
                        disabled={acceptInvitation.isPending || rejectInvitation.isPending}
                      >
                        {rejectInvitation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="mr-1 h-4 w-4" />
                            {t('common.reject')}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-12 text-center">
              {/* Large Icon */}
              <div className="mb-6">
                <Users className="h-24 w-24 text-gray-300" />
              </div>

              {/* Primary Message */}
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                {t('groups.noGroup')}
              </h2>

              {/* Secondary Message */}
              <p className="text-sm text-gray-500 mb-8 max-w-md">
                {t('groups.noGroupDescription')}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => {
                    setShowCreateGroupModal(true)
                    setError('')
                  }}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  {t('groups.createGroup')}
                </Button>
                <Button
                  onClick={() => {
                    setShowJoinGroupModal(true)
                    setError('')
                  }}
                  variant="outline"
                  className="border-gray-300 text-primary hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4 ml-2" />
                  {t('groups.joinGroup')}
                </Button>
              </div>
            </div>
          </div>
        </BlockContent>

        {/* Create Group Modal */}
        <ModalDialog
          open={showCreateGroupModal}
          onOpenChange={setShowCreateGroupModal}
          title={t('groups.createGroup')}
          description={t('groups.createGroupDescription') || 'إنشاء مجموعة جديدة للمشروع'}
        >
          <div className="space-y-4">
            {!registrations || registrations.length === 0 ? (
              <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium mb-1 text-warning">
                    {t('groups.needProjectFirst')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('groups.needProjectFirstDescription') || 'يجب أن يكون لديك تسجيل معتمد في مشروع أولاً قبل إنشاء مجموعة.'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>{t('groups.project') || 'المشروع'}</Label>
                  <p className="text-sm text-muted-foreground">
                    {registrations?.find(r => r.status === 'approved')?.project?.title ||
                      t('groups.noApprovedProject') || 'لا يوجد مشروع معتمد'}
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateGroupModal(false)
                    }}
                    className="flex-1"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    onClick={handleCreateGroup}
                    disabled={createGroup.isPending || !registrations?.some(r => r.status === 'approved')}
                    className="flex-1 bg-primary text-white hover:bg-primary/90"
                  >
                    {createGroup.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('groups.creating') || 'جاري الإنشاء...'}
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('groups.create') || 'إنشاء'}
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </ModalDialog>

        {/* Join Group Modal */}
        <ModalDialog
          open={showJoinGroupModal}
          onOpenChange={setShowJoinGroupModal}
          title={t('groups.joinGroup')}
          description={t('groups.joinGroupDescription') || 'الانضمام إلى مجموعة موجودة باستخدام معرف المجموعة'}
        >
          <form onSubmit={handleJoinSubmit(handleJoin)} className="space-y-4">
            <div>
              <Label htmlFor="joinGroupId">
                {t('groups.groupId')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="joinGroupId"
                {...registerJoin('joinGroupId')}
                placeholder={t('groups.groupIdPlaceholder')}
                className={joinErrors.joinGroupId ? 'border-red-500' : ''}
                aria-invalid={!!joinErrors.joinGroupId}
              />
              {joinErrors?.joinGroupId && (
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  {joinErrors.joinGroupId.message}
                </p>
              )}
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowJoinGroupModal(false)
                  resetJoin()
                }}
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={joinGroup.isPending}
                className="flex-1 bg-primary text-white hover:bg-primary/90"
              >
                {joinGroup.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('groups.joining')}
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    {t('groups.join')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </ModalDialog>
      </>
    )
  }

  const isLeader = user?.id === group.leaderId
  const isFull = group.members.length >= group.maxMembers

  // Student has approved registration if:
  // 1. Registration status is 'approved', OR
  // 2. Student is in the project's students list (already attached)
  const hasApprovedRegistration =
    registration?.status === 'approved' ||
    (group.project?.students && group.project.students.some(s => s.id === user?.id))

  // Show warning if no approved registration
  if (!hasApprovedRegistration) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            {t('groups.registrationRequired')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
            <div className="flex-1">
              <p className="font-medium mb-1 text-warning">
                {t('groups.registrationRequiredTitle')}
              </p>
              <p className="text-sm text-muted-foreground">
                {registration?.status === 'pending'
                  ? t('groups.registrationPendingMessage')
                  : t('groups.registrationNotApprovedMessage')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {success && (
        <Card className="border-success">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-5 w-5" />
              <span>{success}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {invitations && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              {t('groups.invitations')}
            </CardTitle>
            <CardDescription>
              {t('groups.invitationsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-start gap-3 p-4 bg-info/10 border border-info/20 rounded-lg"
                >
                  <Mail className="h-5 w-5 text-info mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium mb-1">
                      {t('groups.invitationFrom')}
                    </p>
                    {invitation.inviter && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {t('groups.from')}: {invitation.inviter.name}
                      </p>
                    )}
                    {invitation.message && (
                      <p className="text-sm text-muted-foreground mb-2">{invitation.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(invitation.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => acceptInvitation.mutate(invitation.id)}
                      disabled={acceptInvitation.isPending || rejectInvitation.isPending}
                    >
                      {acceptInvitation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          {t('common.accept')}
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectInvitation.mutate(invitation.id)}
                      disabled={acceptInvitation.isPending || rejectInvitation.isPending}
                    >
                      {rejectInvitation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="mr-1 h-4 w-4" />
                          {t('common.reject')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {t('groups.myGroup')}
              </CardTitle>
              <CardDescription>
                {t('groups.membersCount')}: {group.members.length}/{group.maxMembers}
                {isFull && <span className="text-destructive ms-2">({t('groups.full')})</span>}
              </CardDescription>
            </div>
            {isLeader && (
              <div className="flex items-center gap-1 text-primary">
                <Crown className="h-4 w-4" />
                <span className="text-sm font-medium">{t('groups.leader')}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t('groups.members')}
            </h4>
            <div className="space-y-2">
              {group.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      {member.id === group.leaderId && (
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <Crown className="h-3 w-3" />
                          <span>{t('groups.leader')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {member.id !== group.leaderId && isLeader && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (window.confirm(t('groups.confirmRemove'))) {
                          removeMember.mutate(
                            {
                              groupId: group.id,
                              memberId: member.id,
                            },
                            {
                              onError: (err) => {
                                setError(err instanceof Error ? err.message : t('groups.removeError'))
                              },
                              onSuccess: () => {
                                setSuccess(t('groups.removeSuccess'))
                              },
                            }
                          )
                        }
                      }}
                    >
                      <UserMinus className="mr-1 h-4 w-4" />
                      {t('groups.remove')}
                    </Button>
                  )}
                  {member.id !== group.leaderId && !isLeader && member.id === user?.id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (window.confirm(t('groups.confirmLeave'))) {
                          removeMember.mutate(
                            {
                              groupId: group.id,
                              memberId: member.id,
                            },
                            {
                              onError: (err) => {
                                setError(err instanceof Error ? err.message : t('groups.leaveError'))
                              },
                            }
                          )
                        }
                      }}
                    >
                      <UserMinus className="mr-1 h-4 w-4" />
                      {t('groups.leave')}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isLeader && !isFull && (
            <div className="border-t pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowInviteForm(!showInviteForm)
                  setError('')
                }}
                className="w-full"
              >
                {showInviteForm ? (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    {t('common.cancel')}
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t('groups.inviteMember')}
                  </>
                )}
              </Button>

              {showInviteForm && (
                <form onSubmit={handleInviteSubmit(handleInvite)} className="mt-4 space-y-3">
                  <div>
                    <Label htmlFor="inviteeId">
                      {t('groups.studentId')} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="inviteeId"
                      {...registerInvite('inviteeId')}
                      placeholder={t('groups.studentIdPlaceholder')}
                      className={inviteErrors.inviteeId ? 'border-destructive' : ''}
                      aria-invalid={!!inviteErrors.inviteeId}
                    />
                    {inviteErrors.inviteeId && (
                      <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        {inviteErrors.inviteeId.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="inviteMessage">
                      {t('groups.message')} ({t('common.optional')})
                    </Label>
                    <Textarea
                      id="inviteMessage"
                      {...registerInvite('message')}
                      placeholder={t('groups.messagePlaceholder')}
                      rows={3}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={inviteMember.isPending}
                    className="w-full"
                  >
                    {inviteMember.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('groups.sending')}
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        {t('groups.sendInvitation')}
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


