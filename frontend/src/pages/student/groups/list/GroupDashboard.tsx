import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui'
import { Users, Copy, CheckCircle2, LogOut, UserPlus, Briefcase } from 'lucide-react'
import { useState } from 'react'
import { GroupMembersList } from '../components/GroupMembersList'
import { GroupJoinRequestsList } from '../components/GroupJoinRequestsList'
import type { StudentGroup } from '@/types/project.types'
import { BlockContent } from '@/components/common'

interface GroupDashboardProps {
    group: StudentGroup
    isLeader: boolean
    hasProjectRegistrations: boolean
    projectStatus?: string // e.g. "Registered in Project X"
    onInviteMember: () => void
    onDeleteGroup: () => void
    onLeaveGroup: () => void // Kept in interface but unused in implementation for now (disabled action)
    joinRequestsCount?: number
}

export function GroupDashboard({
    group,
    isLeader,
    hasProjectRegistrations,
    projectStatus,
    onInviteMember,
    onDeleteGroup,
    joinRequestsCount = 0
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

    return (
        <BlockContent title={group.name || t('groups.title')} actions={
            < div className="flex items-center gap-2">
                {isLeader ? (
                    <>
                        <Button onClick={onInviteMember} disabled={group.members.length >= group.maxMembers}>
                            <UserPlus className="size-4" />
                            {t('groups.inviteMember')}
                        </Button>
                    </>
                ) : (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" className="opacity-50 cursor-not-allowed">
                                <LogOut className="size-4" />
                                {t('groups.leave')}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{t('groups.onlyLeaderCanLeaveGroup')}</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
        }>
            {/* Dashboard Header */}
            < div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Users className="w-4 h-4" />
                        {group.members.length} / {group.maxMembers} {t('groups.membersCount')}
                        {group.members.length >= group.maxMembers && (
                            <span className="text-destructive text-xs font-medium border border-destructive px-1 rounded">
                                {t('groups.full')}
                            </span>
                        )}
                        <Badge variant={group.status === 'active' ? 'default' : 'secondary'}>
                            {group.status}
                        </Badge>
                    </div>
                </div>
            </div >

            <div className="grid md:grid-cols-3 gap-6">
                {/* Left Column: Members & Main Info */}
                <div className="md:col-span-2 space-y-6">

                    {/* Project Status Card */}
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="flex items-start gap-4">
                            <div className="p-3 bg-primary/20 rounded-lg text-primary">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">{t('common.status')}</h3>
                                <p className="text-sm text-foreground/80">
                                    {projectStatus ? (
                                        <span className="text-green-600 font-medium flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> {projectStatus}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            {t('dashboard.student.notRegisteredInProject')}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Members List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('groups.members')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <GroupMembersList group={group} />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Sidebar / Admin Panel */}
                <div className="space-y-6">
                    {/* Code Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">{t('groups.groupCode')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 p-2 bg-muted rounded-md border">
                                <code className="flex-1 font-mono text-lg font-bold text-center tracking-wider">
                                    {group.groupCode || 'N/A'}
                                </code>
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={copyGroupCode}>
                                    {isCopied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                                {t('groups.shareGroupId')}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Leader Actions */}
                    {isLeader && (
                        <>
                            {/* Join Requests */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center justify-between">
                                        {t('groups.joinRequests')}
                                        {joinRequestsCount > 0 && (
                                            <Badge variant="destructive" className="ml-2 px-1.5 min-w-[1.25rem] h-5">
                                                {joinRequestsCount}
                                            </Badge>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <GroupJoinRequestsList group={group} />
                                </CardContent>
                            </Card>

                            {/* Danger Zone */}
                            <Card className="border-destructive/30 gap-0 p-0">
                                {/* <CardHeader>
                                    <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
                                </CardHeader> */}
                                <CardContent className="p-3">
                                    <Button
                                        variant="destructive"
                                        className="w-full"
                                        onClick={onDeleteGroup}
                                        disabled={hasProjectRegistrations}
                                        title={hasProjectRegistrations ? t('groups.cannotDeleteGroupWhileRegisteredInProject') : ""}
                                    >
                                        {t('groups.deleteGroup')}
                                    </Button>
                                    {/* {hasProjectRegistrations && (
                                        <p className="text-xs text-destructive mt-2 text-center">
                                            {t('groups.cannotDeleteGroupWhileRegisteredInProject')}
                                        </p>
                                    )} */}
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </BlockContent >
    )
}
