import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui'
import { useState } from 'react'
import React from 'react'
import { useToast } from '@/components/common'
import { BlockContent, ModalDialog, ConfirmDialog, LoadingSpinner } from '@/components/common'
import { Users, Mail, Crown, Loader2, CheckCircle2, XCircle, PlusCircle, UserPlus, Trash2 } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'
import { useAuthStore } from '@/pages/auth/login'
import { useAcceptInvitation, useRejectInvitation, useCreateGroup, useDeleteGroup } from '../hooks/useGroupOperations'
import type { User } from '@/types/user.types'
import { GroupInviteForm } from '../components/GroupInviteForm'
import { GroupJoinForm } from '../components/GroupJoinForm'
import { GroupMembersList } from '../components/GroupMembersList'
import { GroupJoinRequestsList } from '../components/GroupJoinRequestsList'
import { useGroupsList } from './GroupsList.hook'

export function GroupsList() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { toastSuccess, toastError } = useToast()
  const {
    data,
    state,
    setState,
    registrations,
  } = useGroupsList()

  const acceptInvitation = useAcceptInvitation()
  const rejectInvitation = useRejectInvitation()
  const createGroup = useCreateGroup()
  const deleteGroup = useDeleteGroup()
  const [isCopied, setIsCopied] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Check if group has any project registrations - MUST be called before any early returns
  const hasProjectRegistrations = React.useMemo(() => {
    if (!data.group || !registrations || registrations.length === 0) {
      return false
    }
    // Get all member IDs (including leader)
    const memberIds = new Set([
      data.group.leaderId,
      ...data.group.members.map(m => m.id)
    ])
    // Check if any registration belongs to a group member
    return registrations.some(reg => memberIds.has(reg.studentId))
  }, [data.group, registrations])

  const handleCreateGroup = async (name?: string, members: User[] = []) => {
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
      }))
      toastSuccess(t('groups.createSuccess'))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('groups.createError')
      toastError(errorMessage)
    }
  }

  // Show loading spinner while data is being fetched
  if (data.isLoading) {
    return (
      <BlockContent title={t('groups.management')} className="bg-white">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </BlockContent>
    )
  }

  // Show empty state only after loading is complete and no group exists
  if (!data.group) {
    const headerActions = (
      <div className="flex items-center gap-3">
        <Button
          onClick={() => {
            setState((prev) => ({ ...prev, showJoinGroupModal: true }))
          }}
          variant="outline"
        >
          <UserPlus className="h-4 w-4 ml-2" />
          {t('groups.joinGroup')}
        </Button>
        <Button
          onClick={() => {
            setState((prev) => ({ ...prev, showCreateGroupModal: true }))
          }}
          className="bg-primary text-white hover:bg-primary/90"
        >
          <PlusCircle className="h-4 w-4 ml-2" />
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
            {/* Removed inline success/error blocks */}

            {data.invitations && data.invitations.length > 0 && (
              // ... (invitations rendering)
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
                        onClick={() => acceptInvitation.mutate(invitation.id, {
                          onSuccess: () => toastSuccess('groups.invitationAccepted'),
                          onError: (err) => toastError(err.message)
                        })}
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
                        onClick={() => rejectInvitation.mutate(invitation.id, {
                          onSuccess: () => toastSuccess('groups.invitationRejected'),
                          onError: (err) => toastError(err.message)
                        })}
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
                    setState((prev) => ({ ...prev, showCreateGroupModal: true }))
                  }}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  <PlusCircle className="h-4 w-4 ml-2" />
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
              }))
              toastSuccess(t('groups.joinSuccess'))
            }}
            onError={(error) => {
              toastError(error)
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
                    <PlusCircle className="size-4" />
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

  const headerActions = isLeader && !isFull ? (
    <Button
      onClick={() => {
        setState((prev) => ({
          ...prev,
          showInviteModal: true,
        }))
      }}
      className="bg-primary text-white hover:bg-primary/90"
    >
      <PlusCircle className="h-4 w-4 ml-2" />
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
          {/* Removed inline success block */}

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
                          onClick={() => acceptInvitation.mutate(invitation.id, {
                            onSuccess: () => toastSuccess('groups.invitationAccepted'),
                            onError: (err) => toastError(err.message)
                          })}
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
                          onClick={() => rejectInvitation.mutate(invitation.id, {
                            onSuccess: () => toastSuccess('groups.invitationRejected'),
                            onError: (err) => toastError(err.message)
                          })}
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-primary" />
                      {t('groups.groupId')}
                    </CardTitle>
                    <CardDescription>{t('groups.groupIdDescription')}</CardDescription>
                  </div>
                  {/* Delete Button - Only show if no project registrations */}
                  {!hasProjectRegistrations && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (!data.group) return
                        setShowDeleteDialog(true)
                      }}
                      disabled={deleteGroup.isPending}
                    >
                      {deleteGroup.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('groups.deleting')}
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('groups.deleteGroup')}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">{t('groups.shareGroupCode')}</p>
                    <p className="text-2xl font-bold text-primary font-mono">{data.group.groupCode || t('groups.noCode')}</p>
                  </div>
                  <Tooltip open={isCopied}>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (data.group?.groupCode) {
                            navigator.clipboard.writeText(data.group.groupCode)
                            setIsCopied(true)
                            setTimeout(() => setIsCopied(false), 2000)
                          }
                        }}
                      >
                        {t('common.copy')}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span>{t('groups.groupCodeCopied')}</span>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Join Requests for Leader */}
          {isLeader && (
            <GroupJoinRequestsList
              group={data.group}
              onError={(error) => toastError(error)}
              onSuccess={(message) => toastSuccess(message)}
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
              {/* Removed inline error block */}

              <GroupMembersList
                group={data.group}
                onError={(error) => toastError(error)}
                onSuccess={(message) => toastSuccess(message)}
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
              }))
              toastSuccess(t('groups.inviteSuccess'))
            }}
            onError={(error) => {
              toastError(error)
            }}
          />
        </ModalDialog>
      )}

      {/* Delete Group Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => {
          if (!data.group) return
          deleteGroup.mutate(data.group.id, {
            onSuccess: () => {
              toastSuccess(t('groups.deleteSuccess'))
            },
            onError: (err) => {
              toastError(err instanceof Error ? err.message : t('groups.deleteError'))
            },
          })
        }}
        title={t('groups.deleteGroup')}
        description={t('groups.confirmDeleteGroup')}
        variant="destructive"
        confirmLabel={t('groups.deleteGroup')}
      />

    </>
  )
}
