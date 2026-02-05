import { useTranslation } from 'react-i18next'
import { Card, Button } from '@/components/ui'
import { PlusCircle, UserPlus, Mail, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { MyJoinRequestsList } from '../components/MyJoinRequestsList'
import { formatRelativeTime } from '@/lib/utils/format'
import type { GroupInvitation } from '@/types/project.types'
import { BlockContent } from '@/components/common'
import { Users } from 'lucide-react'

interface NoGroupViewProps {
    invitations: GroupInvitation[] | undefined
    hasPendingJoinRequest: boolean
    onCreateClick: () => void
    onJoinClick: () => void
    onAcceptInvite: (id: string) => void
    onRejectInvite: (id: string) => void
    isProcessingInvite: boolean
}

export function NoGroupView({
    invitations,
    hasPendingJoinRequest,
    onCreateClick,
    onJoinClick,
    onAcceptInvite,
    onRejectInvite,
    isProcessingInvite,
}: NoGroupViewProps) {
    const { t } = useTranslation()

    const headerActions = (
        <div className="flex items-center gap-3">
            {!hasPendingJoinRequest && (
                <>
                    <Button onClick={onCreateClick} variant="default" className="gap-2" disabled={hasPendingJoinRequest}>
                        <PlusCircle className="size-4" />
                        {t('groups.createGroup')}
                    </Button>
                    <Button onClick={onJoinClick} variant="outline" className="gap-2" disabled={hasPendingJoinRequest}>
                        <UserPlus className="size-4" />
                        {t('groups.joinGroup')}
                    </Button>
                </>
            )}
        </div>
    )

    return (
        <BlockContent title={t('groups.management')} actions={headerActions}>
            {/* Centered empty state */}
            {!hasPendingJoinRequest && (
                <div className="flex flex-col items-center justify-center text-center py-12 px-4 min-h-[320px] border-b border-border/80">
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 text-muted-foreground mb-6">
                        <Users className="size-12 stroke-[1.5]" aria-hidden />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                        {t('groups.noGroup')}
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6 text-sm">
                        {t('groups.noGroupDescription')}
                    </p>
                    <Button
                        onClick={onCreateClick}
                        variant="default"
                        className="gap-2"
                        disabled={hasPendingJoinRequest}
                    >
                        <PlusCircle className="size-4" />
                        {t('groups.createGroup')}
                    </Button>
                </div>
            )}

            {/* Pending join request notice */}
            {hasPendingJoinRequest && (
                <div className="p-4 mt-4 mx-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm text-center">
                    {t('group.pendingRequestWarning')}
                </div>
            )}

            {/* Invitations */}
            {invitations && invitations.length > 0 && (
                <div className="mt-6 px-4 pb-6">
                    <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                        <Mail className="size-4" />
                        {t('groups.invitations')}
                    </h3>
                    <div className="space-y-3">
                        {invitations.map((invitation) => (
                            <Card
                                key={invitation.id}
                                className="overflow-hidden border border-border/80"
                            >
                                <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-primary/10 rounded-full text-primary shrink-0">
                                            <Mail className="size-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-sm">
                                                {t('groups.invitationFrom')}
                                            </h4>
                                            {invitation.inviter && (
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {invitation.inviter.name} {t('groups.from')}
                                                </p>
                                            )}
                                            {invitation.message && (
                                                <p className="text-xs mt-1 p-2 bg-muted rounded-md italic">
                                                    {invitation.message}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatRelativeTime(invitation.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                                        <Button
                                            size="sm"
                                            onClick={() => onAcceptInvite(invitation.id)}
                                            disabled={isProcessingInvite}
                                            className="gap-1.5"
                                        >
                                            {isProcessingInvite ? (
                                                <Loader2 className="size-4 animate-spin" />
                                            ) : (
                                                <CheckCircle2 className="size-4" />
                                            )}
                                            {t('common.accept')}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 gap-1.5"
                                            onClick={() => onRejectInvite(invitation.id)}
                                            disabled={isProcessingInvite}
                                        >
                                            {isProcessingInvite ? (
                                                <Loader2 className="size-4 animate-spin" />
                                            ) : (
                                                <XCircle className="size-4" />
                                            )}
                                            {t('common.reject')}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* My sent join requests */}
            <div className="mt-6 px-4 pb-6">
                <MyJoinRequestsList />
            </div>
        </BlockContent>
    )
}
