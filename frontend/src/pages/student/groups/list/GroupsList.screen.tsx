import { useTranslation } from 'react-i18next'
import { useState, useMemo } from 'react'
import { useToast, ModalDialog, ConfirmDialog, BlockContent, LoadingSpinner } from '@/components/common'
import { Loader2, PlusCircle } from 'lucide-react'
import { useAuthStore } from '@/pages/auth/login'
import { useAcceptInvitation, useRejectInvitation, useCreateGroup, useDeleteGroup, useMyJoinRequests } from '../hooks/useGroupOperations'
import { useGroupJoinRequests } from '../hooks/useGroups'
import { GroupInviteForm } from '../components/GroupInviteForm'
import { GroupJoinForm } from '../components/GroupJoinForm'
import { useGroupsList } from './GroupsList.hook'
import { NoGroupView } from './NoGroupView'
import { GroupDashboard } from './GroupDashboard'
import type { User } from '@/types/user.types'
import { Button } from '@/components/ui'

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
  const myJoinReqsQuery = useMyJoinRequests()
  const myJoinRequestsData = myJoinReqsQuery.data

  const isLeader = user?.id === data.group?.leaderId
  const { data: joinRequests } = useGroupJoinRequests(isLeader && data.group ? data.group.id : undefined)
  const joinRequestsCount = joinRequests ? joinRequests.filter(r => r.status === 'pending').length : 0

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Check if there's a pending join request
  const hasPendingJoinRequest = useMemo(() => {
    if (!myJoinRequestsData || myJoinRequestsData.length === 0) {
      return false
    }
    return myJoinRequestsData.some((request: any) => request.status === 'pending')
  }, [myJoinRequestsData])

  // Check if group has any project registrations
  const hasProjectRegistrations = useMemo(() => {
    if (!data.group || !registrations || registrations.length === 0) {
      return false
    }
    // Get all member IDs (including leader)
    const memberIds = new Set([
      data.group.leaderId,
      ...data.group.members.map((m: any) => m.id)
    ])
    // Check if any registration belongs to a group member
    return registrations.some(reg => memberIds.has(reg.studentId))
  }, [data.group, registrations])

  // Get current project status string
  const projectStatus = useMemo(() => {
    if (!registrations) return undefined;
    const approved = registrations.find(r => r.status === 'approved');
    if (approved) return t('status.registered') + (approved.project ? `: ${approved.project.title}` : '');
    const pending = registrations.find(r => r.status === 'pending');
    if (pending) return t('status.pending');
    return undefined;
  }, [registrations, t])

  const handleCreateGroup = async (name?: string, members: User[] = []) => {
    try {
      const memberIds = Array.isArray(members) && members.length > 0
        ? members.map(m => (typeof m === 'object' && m !== null && 'id' in m ? m.id : m)).filter(Boolean)
        : []
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

  // Show loading spinner
  if (data.isLoading) {
    return (
      <BlockContent title={t('groups.management')} className="bg-white">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </BlockContent>
    )
  }

  return (
    <div className="container mx-auto">
      {!data.group ? (
        <NoGroupView
          invitations={data.invitations}
          hasPendingJoinRequest={hasPendingJoinRequest}
          onCreateClick={() => setState((prev) => ({ ...prev, showCreateGroupModal: true }))}
          onJoinClick={() => setState((prev) => ({ ...prev, showJoinGroupModal: true }))}
          onAcceptInvite={(id) => acceptInvitation.mutate(id, {
            onSuccess: () => toastSuccess('groups.invitationAccepted'),
            onError: (err) => toastError(err.message)
          })}
          onRejectInvite={(id) => rejectInvitation.mutate(id, {
            onSuccess: () => toastSuccess('groups.invitationRejected'),
            onError: (err) => toastError(err.message)
          })}
          isProcessingInvite={acceptInvitation.isPending || rejectInvitation.isPending}
        />
      ) : (
        <GroupDashboard
          group={data.group as any}
          isLeader={user?.id === data.group.leaderId}
          hasProjectRegistrations={hasProjectRegistrations}
          projectStatus={projectStatus}
          onInviteMember={() => setState((prev) => ({ ...prev, showInviteModal: true }))}
          onDeleteGroup={() => setShowDeleteDialog(true)}
          onLeaveGroup={() => { }}
          joinRequestsCount={joinRequestsCount}
        />
      )}

      {/* Modals */}
      <ModalDialog
        open={state.showJoinGroupModal}
        onOpenChange={(open) => setState((prev) => ({ ...prev, showJoinGroupModal: open }))}
        title={t('groups.joinGroup')}
        description={t('groups.joinGroupDescription')}
      >
        <GroupJoinForm
          onSuccess={() => {
            setState((prev) => ({ ...prev, showJoinGroupModal: false }))
            toastSuccess(t('groups.joinRequestSent'))
          }}
          onError={(error) => toastError(error)}
        />
      </ModalDialog>

      <ModalDialog
        open={state.showCreateGroupModal}
        onOpenChange={(open) => setState((prev) => ({ ...prev, showCreateGroupModal: open }))}
        title={t('groups.createGroup')}
      >
        <div className="space-y-4">
          <p>{t('groups.createGroupDescription')}</p>
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

      {data.group && (
        <ModalDialog
          open={state.showInviteModal}
          onOpenChange={(open) => setState((prev) => ({ ...prev, showInviteModal: open }))}
          title={t('groups.inviteMember')}
        >
          <GroupInviteForm
            group={data.group}
            onSuccess={() => {
              setState((prev) => ({ ...prev, showInviteModal: false }))
              toastSuccess(t('groups.inviteSuccess'))
            }}
            onError={(error) => toastError(error)}
          />
        </ModalDialog>
      )}

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => {
          if (!data.group) return
          deleteGroup.mutate(data.group.id, {
            onSuccess: () => {
              toastSuccess(t('groups.deleteSuccess'))
              setShowDeleteDialog(false)
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
    </div>
  )
}
