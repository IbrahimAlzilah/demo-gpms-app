import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useMyGroup,
  useRemoveGroupMember,
  useInviteGroupMember,
  useGroupInvitations,
  useAcceptInvitation,
  useRejectInvitation,
  useJoinGroup,
} from '../hooks/useGroups'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { useAuthStore } from '../../auth/store/auth.store'
import { AlertCircle, Users, UserPlus, UserMinus, Mail, Crown, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { formatRelativeTime } from '../../../lib/utils/format'

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

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteeId, setInviteeId] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [joinGroupId, setJoinGroupId] = useState('')

  const handleInvite = async () => {
    if (!group || !inviteeId.trim()) {
      setError(t('group.validation.studentIdRequired'))
      return
    }

    if (group.members.length >= group.maxMembers) {
      setError(t('group.fullCapacity'))
      return
    }

    setError('')
    setSuccess('')
    try {
      await inviteMember.mutateAsync({
        groupId: group.id,
        inviteeId: inviteeId.trim(),
        message: inviteMessage.trim() || undefined,
      })
      setInviteeId('')
      setInviteMessage('')
      setShowInviteForm(false)
      setSuccess(t('group.inviteSuccess'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('group.inviteError'))
    }
  }

  const handleJoin = async () => {
    if (!joinGroupId.trim()) {
      setError(t('group.validation.groupIdRequired'))
      return
    }

    setError('')
    setSuccess('')
    try {
      await joinGroup.mutateAsync(joinGroupId.trim())
      setJoinGroupId('')
      setShowJoinForm(false)
      setSuccess(t('group.joinSuccess'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('group.joinError'))
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
                {t('group.invitations')}
              </CardTitle>
              <CardDescription>
                {t('group.invitationsDescription')}
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
                        {t('group.invitationFrom')}
                      </p>
                      {invitation.inviter && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {t('group.from')}: {invitation.inviter.name}
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

        {error && (
          <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 p-3 text-sm text-success bg-success/10 border border-success/20 rounded-md">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <Button
          onClick={() => {
            setError(t('group.needProjectFirst'))
          }}
          className="w-full"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          {t('group.createNew')}
        </Button>

        <div className="border-t pt-4">
          <Button
            variant="outline"
            onClick={() => {
              setShowJoinForm(!showJoinForm)
              setError('')
            }}
            className="w-full"
          >
            {showJoinForm ? (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                {t('common.cancel')}
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                {t('group.joinExisting')}
              </>
            )}
          </Button>

          {showJoinForm && (
            <div className="mt-4 space-y-3">
              <div>
                <Label htmlFor="joinGroupId">
                  {t('group.groupId')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="joinGroupId"
                  value={joinGroupId}
                  onChange={(e) => {
                    setJoinGroupId(e.target.value)
                    setError('')
                  }}
                  placeholder={t('group.groupIdPlaceholder')}
                  className={error ? 'border-destructive' : ''}
                />
              </div>
              <Button
                onClick={handleJoin}
                disabled={joinGroup.isPending || !joinGroupId.trim()}
                className="w-full"
              >
                {joinGroup.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('group.joining')}
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    {t('group.join')}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const isLeader = user?.id === group.leaderId
  const isFull = group.members.length >= group.maxMembers

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
              {t('group.invitations')}
            </CardTitle>
            <CardDescription>
              {t('group.invitationsDescription')}
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
                      {t('group.invitationFrom')}
                    </p>
                    {invitation.inviter && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {t('group.from')}: {invitation.inviter.name}
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
                {t('group.myGroup')}
              </CardTitle>
              <CardDescription>
                {t('group.membersCount')}: {group.members.length}/{group.maxMembers}
                {isFull && <span className="text-destructive ms-2">({t('group.full')})</span>}
              </CardDescription>
            </div>
            {isLeader && (
              <div className="flex items-center gap-1 text-primary">
                <Crown className="h-4 w-4" />
                <span className="text-sm font-medium">{t('group.leader')}</span>
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
              {t('group.members')}
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
                          <span>{t('group.leader')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {member.id !== group.leaderId && isLeader && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (window.confirm(t('group.confirmRemove'))) {
                          removeMember.mutate(
                            {
                              groupId: group.id,
                              memberId: member.id,
                            },
                            {
                              onError: (err) => {
                                setError(err instanceof Error ? err.message : t('group.removeError'))
                              },
                              onSuccess: () => {
                                setSuccess(t('group.removeSuccess'))
                              },
                            }
                          )
                        }
                      }}
                    >
                      <UserMinus className="mr-1 h-4 w-4" />
                      {t('group.remove')}
                    </Button>
                  )}
                  {member.id !== group.leaderId && !isLeader && member.id === user?.id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (window.confirm(t('group.confirmLeave'))) {
                          removeMember.mutate(
                            {
                              groupId: group.id,
                              memberId: member.id,
                            },
                            {
                              onError: (err) => {
                                setError(err instanceof Error ? err.message : t('group.leaveError'))
                              },
                            }
                          )
                        }
                      }}
                    >
                      <UserMinus className="mr-1 h-4 w-4" />
                      {t('group.leave')}
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
                    {t('group.inviteMember')}
                  </>
                )}
              </Button>

              {showInviteForm && (
                <div className="mt-4 space-y-3">
                  <div>
                    <Label htmlFor="inviteeId">
                      {t('group.studentId')} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="inviteeId"
                      value={inviteeId}
                      onChange={(e) => {
                        setInviteeId(e.target.value)
                        setError('')
                      }}
                      placeholder={t('group.studentIdPlaceholder')}
                      className={error ? 'border-destructive' : ''}
                    />
                  </div>
                  <div>
                    <Label htmlFor="inviteMessage">
                      {t('group.message')} ({t('common.optional')})
                    </Label>
                    <Textarea
                      id="inviteMessage"
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      placeholder={t('group.messagePlaceholder')}
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={handleInvite}
                    disabled={inviteMember.isPending || !inviteeId.trim()}
                    className="w-full"
                  >
                    {inviteMember.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('group.sending')}
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        {t('group.sendInvitation')}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

