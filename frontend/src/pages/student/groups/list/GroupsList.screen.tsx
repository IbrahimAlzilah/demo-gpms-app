import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@/components/ui'
import { BlockContent, ModalDialog, LoadingSpinner } from '@/components/common'
import { AlertCircle, Users, Mail, Crown, Loader2, CheckCircle2, XCircle, Plus, UserPlus } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'
import { useAuthStore } from '@/pages/auth/login'
import { useAcceptInvitation, useRejectInvitation, useCreateGroup } from '../hooks/useGroupOperations'
import type { User } from '@/types/user.types'
import { GroupInviteForm } from '../components/GroupInviteForm'
import { GroupJoinForm } from '../components/GroupJoinForm'
import { GroupMembersList } from '../components/GroupMembersList'
import { GroupJoinRequestsList } from '../components/GroupJoinRequestsList'
import { useGroupsList } from './GroupsList.hook'

export function GroupsList() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const {
    data,
    state,
    setState,
    registrations,
  } = useGroupsList()

  const acceptInvitation = useAcceptInvitation()
  const rejectInvitation = useRejectInvitation()
  const createGroup = useCreateGroup()

  const handleCreateGroup = async (name?: string, members: User[] = []) => {
    setState((prev) => ({ ...prev, error: '', success: '' }))
    try {
      // Ensure we only pass user IDs, not full User objects with React elements
      const memberIds = Array.isArray(members) && members.length > 0
        ? members.map(m => (typeof m === 'object' && m !== null && 'id' in m ? m.id : m)).filter(Boolean)
        : []
      
      // Map to User objects with just id property if needed
      const cleanMembers: User[] = memberIds.map(id => ({ id: String(id) } as User))
      
      await createGroup.mutateAsync({
        name: name || null,
        members: cleanMembers,
      })
      setState((prev) => ({
        ...prev,
        showCreateGroupModal: false,
        success: t('groups.createSuccess'),
      }))
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : t('groups.createError'),
      }))
    }
  }

  if (data.isLoading || data.invitationsLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (!data.group) {
    const headerActions = (
      <div className="flex items-center gap-3">
        <Button
          onClick={() => {
            setState((prev) => ({ ...prev, showJoinGroupModal: true, error: '' }))
          }}
          variant="outline"
        >
          <UserPlus className="h-4 w-4 ml-2" />
          {t('groups.joinGroup')}
        </Button>
        <Button
          onClick={() => {
            setState((prev) => ({ ...prev, showCreateGroupModal: true, error: '' }))
          }}
          className="bg-primary text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 ml-2" />
          {t('groups.createGroup')}
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
            {state.success && (
              <div className="flex items-start gap-2 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{state.success}</span>
              </div>
            )}

            {state.error && (
              <div className="flex items-start gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            {data.invitations && data.invitations.length > 0 && (
              <div className="mb-6 space-y-3">
                {data.invitations.map((invitation) => (
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
              <div className="mb-6">
                <Users className="h-24 w-24 text-gray-300" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                {t('groups.noGroup')}
              </h2>
              <p className="text-sm text-gray-500 mb-8 max-w-md">
                {t('groups.noGroupDescription')}
              </p>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => {
                    setState((prev) => ({ ...prev, showCreateGroupModal: true, error: '' }))
                  }}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 ml-2" />
                  {t('groups.createGroup')}
                </Button>
              </div>
            </div>
          </div>
        </BlockContent>

        {/* Join Group Modal */}
        <ModalDialog
          open={state.showJoinGroupModal}
          onOpenChange={(open) => setState((prev) => ({ ...prev, showJoinGroupModal: open }))}
          title={t('groups.joinGroup')}
          description={t('groups.joinGroupDescription')}
        >
          <GroupJoinForm
            onSuccess={() => {
              setState((prev) => ({
                ...prev,
                showJoinGroupModal: false,
                success: t('groups.joinSuccess'),
                error: '',
              }))
            }}
            onError={(error) => {
              setState((prev) => ({ ...prev, error }))
            }}
          />
        </ModalDialog>

        {/* Create Group Modal */}
        <ModalDialog
          open={state.showCreateGroupModal}
          onOpenChange={(open) => setState((prev) => ({ ...prev, showCreateGroupModal: open }))}
          title={t('groups.createGroup')}
          description={t('groups.createGroupDescription')}
        >
          <div className="space-y-4">
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setState((prev) => ({ ...prev, showCreateGroupModal: false }))}
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={() => handleCreateGroup()}
                disabled={createGroup.isPending}
                className="flex-1 bg-primary text-white hover:bg-primary/90"
              >
                {createGroup.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('groups.creating')}
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('groups.create')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </ModalDialog>
      </>
    )
  }

  const isLeader = user?.id === data.group.leaderId
  const isFull = data.group.members.length >= data.group.maxMembers

  // Check if user has an approved registration for the group's project
  // const groupProjectRegistration = data.group.projectId
  //   ? registrations?.find(r => r.projectId === data.group.projectId && r.status === 'approved')
  //   : null

  // const hasApprovedRegistration =
  //   groupProjectRegistration ||
  //   (data.group.project?.students && data.group.project.students.some(s => s.id === user?.id))

  // if (!hasApprovedRegistration) {
  //   // Find the registration for this project to show appropriate message
  //   const projectRegistration = data.group.projectId
  //     ? registrations?.find(r => r.projectId === data.group.projectId)
  //     : null

  //   return (
  //     <Card>
  //       <CardHeader>
  //         <CardTitle className="flex items-center gap-2">
  //           <AlertCircle className="h-5 w-5 text-warning" />
  //           {t('groups.registrationRequired')}
  //         </CardTitle>
  //       </CardHeader>
  //       <CardContent>
  //         <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
  //           <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
  //           <div className="flex-1">
  //             <p className="font-medium mb-1 text-warning">
  //               {t('groups.registrationRequiredTitle')}
  //             </p>
  //             <p className="text-sm text-muted-foreground">
  //               {projectRegistration?.status === 'pending'
  //                 ? t('groups.registrationPendingMessage')
  //                 : t('groups.registrationNotApprovedMessage')}
  //             </p>
  //           </div>
  //         </div>
  //       </CardContent>
  //     </Card>
  //   )
  // }

  const headerActions = isLeader && !isFull ? (
    <Button
      onClick={() => {
        setState((prev) => ({
          ...prev,
          showInviteModal: true,
          error: '',
        }))
      }}
      className="bg-primary text-white hover:bg-primary/90"
    >
      <Plus className="h-4 w-4 ml-2" />
      {t('groups.inviteMember')}
    </Button>
  ) : null

  return (
    <>
      <BlockContent
        title={t('groups.management')}
        actions={headerActions}
        className="bg-white"
      >
        <div className="space-y-6">
          {state.success && (
            <Card className="border-success">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>{state.success}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {data.invitations && data.invitations.length > 0 && (
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
                  {data.invitations.map((invitation) => (
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

          {/* Group ID Display for Leader */}
          {isLeader && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  {t('groups.groupId')}
                </CardTitle>
                <CardDescription>{t('groups.groupIdDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">{t('groups.shareGroupId')}</p>
                    <p className="text-2xl font-bold text-primary font-mono">{data.group.id}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(data.group?.id || '')
                      setState((prev) => ({
                        ...prev,
                        success: t('groups.groupIdCopied'),
                      }))
                    }}
                  >
                    {t('common.copy')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Join Requests for Leader */}
          {isLeader && (
            <GroupJoinRequestsList
              group={data.group}
              onError={(error) => setState((prev) => ({ ...prev, error }))}
              onSuccess={(message) => setState((prev) => ({ ...prev, success: message, error: '' }))}
            />
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
                    {t('groups.membersCount')}: {data.group.members.length}/{data.group.maxMembers}
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
              {state.error && (
                <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{state.error}</span>
                </div>
              )}

              <GroupMembersList
                group={data.group}
                onError={(error) => setState((prev) => ({ ...prev, error }))}
                onSuccess={(message) => setState((prev) => ({ ...prev, success: message, error: '' }))}
              />
            </CardContent>
          </Card>
        </div>
      </BlockContent>

      {/* Invite Member Modal */}
      {isLeader && !isFull && (
        <ModalDialog
          open={state.showInviteModal}
          onOpenChange={(open) => setState((prev) => ({ ...prev, showInviteModal: open }))}
          title={t('groups.inviteMember')}
        >
          <GroupInviteForm
            group={data.group}
            onSuccess={() => {
              setState((prev) => ({
                ...prev,
                showInviteModal: false,
                success: t('groups.inviteSuccess'),
                error: '',
              }))
            }}
            onError={(error) => {
              setState((prev) => ({ ...prev, error }))
            }}
          />
        </ModalDialog>
      )}
    </>
  )
}
