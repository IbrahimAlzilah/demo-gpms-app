import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BlockContent, ModalDialog, LoadingSpinner } from '@/components/common'
import { AlertCircle, Users, Mail, Crown, Loader2, CheckCircle2, XCircle, Plus, ArrowLeft } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useAcceptInvitation, useRejectInvitation, useCreateGroup } from '../hooks/useGroupOperations'
import { GroupInviteForm } from '../components/GroupInviteForm'
import { GroupJoinForm } from '../components/GroupJoinForm'
import { GroupMembersList } from '../components/GroupMembersList'
import { useGroupsList } from './GroupsList.hook'

export function GroupsList() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const {
    data,
    state,
    setState,
    registration,
    registrations,
  } = useGroupsList()

  const acceptInvitation = useAcceptInvitation()
  const rejectInvitation = useRejectInvitation()
  const createGroup = useCreateGroup()

  const handleCreateGroup = async () => {
    const approvedRegistration = registrations?.find(r => r.status === 'approved')

    if (!approvedRegistration) {
      setState((prev) => ({
        ...prev,
        error: t('groups.needProjectFirst'),
        showCreateGroupModal: false,
      }))
      return
    }

    setState((prev) => ({ ...prev, error: '', success: '' }))
    try {
      await createGroup.mutateAsync({
        projectId: approvedRegistration.projectId,
        members: [],
      })
      setState((prev) => ({
        ...prev,
        showCreateGroupModal: false,
        success: t('groups.createSuccess') || 'تم إنشاء المجموعة بنجاح',
      }))
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : t('groups.createError') || 'فشل إنشاء المجموعة',
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
            setState((prev) => ({ ...prev, showCreateGroupModal: true, error: '' }))
          }}
          className="bg-primary text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 ml-2" />
          {t('groups.createGroup')}
        </Button>
        <Button
          onClick={() => {
            setState((prev) => ({ ...prev, showJoinGroupModal: true, error: '' }))
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
                <Button
                  onClick={() => {
                    setState((prev) => ({ ...prev, showJoinGroupModal: true, error: '' }))
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
          open={state.showCreateGroupModal}
          onOpenChange={(open) => setState((prev) => ({ ...prev, showCreateGroupModal: open }))}
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
                  <p className="text-sm font-medium">{t('groups.project') || 'المشروع'}</p>
                  <p className="text-sm text-muted-foreground">
                    {registrations?.find(r => r.status === 'approved')?.project?.title ||
                      t('groups.noApprovedProject') || 'لا يوجد مشروع معتمد'}
                  </p>
                </div>
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
          open={state.showJoinGroupModal}
          onOpenChange={(open) => setState((prev) => ({ ...prev, showJoinGroupModal: open }))}
          title={t('groups.joinGroup')}
          description={t('groups.joinGroupDescription') || 'الانضمام إلى مجموعة موجودة باستخدام معرف المجموعة'}
        >
          <GroupJoinForm
            onSuccess={() => {
              setState((prev) => ({
                ...prev,
                showJoinGroupModal: false,
                success: t('groups.joinSuccess'),
              }))
            }}
            onError={(error) => {
              setState((prev) => ({ ...prev, error }))
            }}
          />
        </ModalDialog>
      </>
    )
  }

  const isLeader = user?.id === data.group.leaderId
  const isFull = data.group.members.length >= data.group.maxMembers

  const hasApprovedRegistration =
    registration?.status === 'approved' ||
    (data.group.project?.students && data.group.project.students.some(s => s.id === user?.id))

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

          {isLeader && !isFull && (
            <div className="border-t pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setState((prev) => ({
                    ...prev,
                    showInviteForm: !prev.showInviteForm,
                    error: '',
                  }))
                }}
                className="w-full"
              >
                {state.showInviteForm ? (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    {t('common.cancel')}
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('groups.inviteMember')}
                  </>
                )}
              </Button>

              {state.showInviteForm && (
                <div className="mt-4">
                  <GroupInviteForm
                    group={data.group}
                    onSuccess={() => {
                      setState((prev) => ({
                        ...prev,
                        showInviteForm: false,
                        success: t('groups.inviteSuccess'),
                        error: '',
                      }))
                    }}
                    onError={(error) => {
                      setState((prev) => ({ ...prev, error }))
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
