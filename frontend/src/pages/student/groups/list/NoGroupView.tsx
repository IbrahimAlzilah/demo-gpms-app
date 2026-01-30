import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from '@/components/ui'
import { PlusCircle, UserPlus, Mail, CheckCircle2, XCircle, ArrowRight, Loader2 } from 'lucide-react'
import { MyJoinRequestsList } from '../components/MyJoinRequestsList'
import { formatRelativeTime } from '@/lib/utils/format'
import type { GroupInvitation } from '@/types/project.types'
import { BlockContent } from '@/components/common'
import { useMemo } from 'react'

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
    isProcessingInvite
}: NoGroupViewProps) {
    const { t } = useTranslation()

    const actions = useMemo(() => {
        return (
            <div className="flex items-center gap-3">
                <Button onClick={onCreateClick} variant="default">
                    <PlusCircle className="size-4" />
                    {t('groups.createGroup')}
                </Button>
                <Button onClick={onJoinClick} variant="outline">
                    <UserPlus className="size-4" />
                    {t('groups.joinGroup')}
                </Button>
            </div>

        )
    }, [onCreateClick, onJoinClick])

    return (
        <BlockContent title={t('groups.management')}>
            {/* Hero / Welcome Section */}
            <div className="text-center space-y-4 py-8">
                <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                    {t('groups.noGroupDescription')}
                </p>
            </div>

            {/* Main Actions Grid */}
            {!hasPendingJoinRequest && (
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {/* Create Group Card */}
                    <div className={`relative group ${hasPendingJoinRequest ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}>
                        <Card className={`h-full border-2 transition-all hover:border-primary/50 hover:shadow-md ${hasPendingJoinRequest ? '' : 'cursor-pointer'}`}
                            onClick={!hasPendingJoinRequest ? onCreateClick : undefined}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <PlusCircle className="w-6 h-6" />
                                    </div>
                                    {t('groups.createGroup')}
                                </CardTitle>
                                <CardDescription className="text-base">
                                    {t('groups.createGroupDescription')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        Become the Group Leader
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        Invite other students
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        Manage project registration
                                    </li>
                                </ul>
                                <Button className="w-full" disabled={hasPendingJoinRequest}>
                                    {t('groups.createGroup')} <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Join Group Card */}
                    <div className={`relative group ${hasPendingJoinRequest ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}>
                        <Card className={`h-full border-2 transition-all hover:border-primary/50 hover:shadow-md ${hasPendingJoinRequest ? '' : 'cursor-pointer'}`}
                            onClick={!hasPendingJoinRequest ? onJoinClick : undefined}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <div className="p-2 bg-secondary/20 rounded-full text-secondary-foreground group-hover:bg-secondary group-hover:text-white transition-colors">
                                        <UserPlus className="w-6 h-6" />
                                    </div>
                                    {t('groups.joinGroup')}
                                </CardTitle>
                                <CardDescription className="text-base">
                                    {t('groups.joinGroupDescription')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-secondary-foreground/70" />
                                        Join via Group Code
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-secondary-foreground/70" />
                                        Browse available groups
                                    </li>
                                </ul>
                                <Button variant="outline" className="w-full" disabled={hasPendingJoinRequest}>
                                    {t('groups.joinGroup')} <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {hasPendingJoinRequest && (
                <div className="max-w-2xl mx-auto p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-center text-sm">
                    {t('groups.pendingRequestWarning')}
                </div>
            )}

            {/* Invitations Section */}
            {invitations && invitations.length > 0 && (
                <div className="max-w-4xl mx-auto pt-8 border-t">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        {t('groups.invitations')}
                    </h3>
                    <div className="grid gap-4">
                        {invitations.map((invitation) => (
                            <Card key={invitation.id} className="overflow-hidden border-l-4 border-l-blue-500">
                                <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-base">{t('groups.invitationFrom')}</h4>
                                            {invitation.inviter && (
                                                <p className="text-sm text-muted-foreground">
                                                    <span className="font-medium text-foreground">{invitation.inviter.name}</span> {t('groups.from')}
                                                </p>
                                            )}
                                            {invitation.message && (
                                                <p className="text-sm mt-1 p-2 bg-muted rounded-md italic">"{invitation.message}"</p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatRelativeTime(invitation.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                        <Button
                                            size="sm"
                                            className="flex-1 sm:flex-none"
                                            onClick={() => onAcceptInvite(invitation.id)}
                                            disabled={isProcessingInvite}
                                        >
                                            {isProcessingInvite ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                            {t('common.accept')}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 sm:flex-none text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                                            onClick={() => onRejectInvite(invitation.id)}
                                            disabled={isProcessingInvite}
                                        >
                                            {isProcessingInvite ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                                            {t('common.reject')}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* My Sent Requests Section */}
            <div className="max-w-4xl mx-auto pt-8">
                <MyJoinRequestsList />
            </div>
        </BlockContent>
    )
}
