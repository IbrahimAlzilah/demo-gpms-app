import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { Users, Copy, CheckCircle2, UserPlus, Crown } from 'lucide-react'
import { useState } from 'react'
import { GroupMembersList } from '../components/GroupMembersList'
import { GroupJoinRequestsList } from '../components/GroupJoinRequestsList'
import type { StudentGroup, GroupJoinRequest } from '@/types/project.types'
import { BlockContent } from '@/components/common'

interface GroupDashboardProps {
    group: StudentGroup
    isLeader: boolean
    hasProjectRegistrations: boolean
    projectStatus?: string
    onInviteMember: () => void
    onDeleteGroup: () => void
    onLeaveGroup: () => void
    joinRequestsCount?: number
    /** Pass join requests from parent to avoid duplicate fetch (single source in GroupsList). */
    joinRequests?: GroupJoinRequest[]
}

export function GroupDashboard({
    group,
    isLeader,
    hasProjectRegistrations,
    projectStatus,
    onInviteMember,
    onDeleteGroup,
    joinRequestsCount = 0,
    joinRequests,
}: GroupDashboardProps) {
    const { t } = useTranslation()
    const [isCopied, setIsCopied] = useState(false)

    const copyGroupCode = () => {
        if (group.groupCode) {
            navigator.clipboard.writeText(group.groupCode)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        }
    }

    const memberCount = group.memberCount ?? group.members?.length ?? 0
    const maxMembers = group.maxMembers ?? 5
    const statusText = projectStatus ?? t('dashboard.student.notRegisteredInProject')

    return (
        <BlockContent
            title={t('groups.management')}
            actions={
                <div className="flex items-center gap-2">
                    {isLeader && (
                        <Button
                            onClick={onInviteMember}
                            disabled={memberCount >= maxMembers}
                            title={memberCount >= maxMembers ? t('groups.groupFull') : undefined}
                            className="gap-2"
                        >
                            <UserPlus className="size-4" />
                            {t('groups.inviteMember')}
                        </Button>
                    )}
                </div>
            }
        >
            <div className="space-y-6">
                {/* Card 1: Group Identifier */}
                <Card className="border border-border/80 shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <Crown className="h-5 w-5 text-primary shrink-0" aria-hidden />
                                <CardTitle className="text-base font-semibold">
                                    {t('groups.groupIdentifier')}
                                </CardTitle>
                            </div>
                            {isLeader && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={onDeleteGroup}
                                    disabled={hasProjectRegistrations}
                                    title={
                                        hasProjectRegistrations
                                            ? t('groups.cannotDeleteGroupWhileRegisteredInProject')
                                            : undefined
                                    }
                                >
                                    {t('groups.deleteGroup')}
                                </Button>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {t('groups.groupIdDescription')}
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-xs font-medium text-muted-foreground">
                            {t('groups.shareGroupCode')}
                        </p>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/80">
                            <code className="flex-1 font-mono text-lg font-bold tracking-wider text-foreground">
                                {group.groupCode || '—'}
                            </code>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="shrink-0 gap-1.5"
                                onClick={copyGroupCode}
                                disabled={!group.groupCode}
                            >
                                {isCopied ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        {t('groups.groupCodeCopied')}
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4" />
                                        {t('common.copy')}
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Card 2: My Group & Members */}
                <Card className="border border-border/80 shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary shrink-0" aria-hidden />
                            <CardTitle className="text-base font-semibold">
                                {t('groups.myGroup')}
                            </CardTitle>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <p>
                                {t('groups.membersCount')}: {memberCount}/{maxMembers}
                            </p>
                            <p>
                                {t('common.status')}: {statusText}
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Crown className="h-4 w-4 text-primary" aria-hidden />
                            <span>{t('groups.leader')}</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium mb-3">{t('groups.groupMembers')}</h4>
                            <GroupMembersList group={group} showHeading={false} />
                        </div>
                        {isLeader && joinRequestsCount > 0 && (
                            <div className="pt-4 border-t border-border/80">
                                <GroupJoinRequestsList
                                    group={group}
                                    requests={joinRequests}
                                    joinCount={joinRequestsCount}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </BlockContent>
    )
}
