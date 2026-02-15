import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, Table, TableBody, TableHead, TableHeader, TableRow, Button, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui'
import type { Grade } from '@/types/evaluation.types'
import { StudentGradeRow } from './StudentGradeRow'

interface ProjectGradeCardProps {
    project: Grade['project']
    grades: Grade[]
    onAction: (grade: Grade, action: 'approve' | 'edit' | 'view') => void
    onStageAction: (action: 'approve' | 'publish') => void
    onAdjustmentSave?: (grade: Grade, value: number | null) => Promise<void>
    stage: 'fd1' | 'fd2'
    isOpen?: boolean
    onToggle?: (isOpen: boolean) => void
}

export function ProjectGradeCard({ project, grades, onAction, onStageAction, onAdjustmentSave, stage, isOpen: controlledIsOpen, onToggle }: ProjectGradeCardProps) {
    const { t } = useTranslation()
    const [internalIsOpen, setInternalIsOpen] = useState(false)

    const isOpen = controlledIsOpen ?? internalIsOpen
    const setIsOpen = (open: boolean) => {
        if (onToggle) {
            onToggle(open)
        } else {
            setInternalIsOpen(open)
        }
    }

    // Committee member count: from project.committeeMembers or max evaluations per stage
    const projectSafe = project ?? {}
    const fromProject = (projectSafe as { committeeMembers?: unknown[] })?.committeeMembers?.length
    const fromEvals = grades.reduce((max, grade) => {
        const stageEvaluations = grade.committeeEvaluations?.filter((e: { defenseStage?: string }) => e.defenseStage === stage) || []
        return Math.max(max, stageEvaluations.length)
    }, 0)
    const committeeMemberCount = fromProject ?? (fromEvals || 2)

    // Create an array for rendering headers
    const memberColumns = Array.from({ length: committeeMemberCount }, (_, i) => i + 1)

    // Stage-specific status: use fd1/fd2 approval per stage
    // Stage-specific status: use fd1/fd2 approval per stage
    const pendingCount = grades.filter((g: Grade) => {
        const status = stage === 'fd1' ? g.fd1ApprovalStatus : g.fd2ApprovalStatus
        return status !== 'approved' && status !== 'published'
    }).length

    const allApproved = grades.length > 0 && grades.every((g: Grade) => {
        const status = stage === 'fd1' ? g.fd1ApprovalStatus : g.fd2ApprovalStatus
        return status === 'approved' || status === 'published'
    })

    const anyPublished = grades.some((g: Grade) => stage === 'fd1' ? !!g.fd1Published : !!g.fd2Published)

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-6">
            <Card className="border hover:shadow-sm transition-all duration-200">
                <CardHeader className="p-0">
                    <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                        <div className="flex flex-col gap-1.5 flex-1">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-sm text-foreground tracking-tight">
                                    {t('committee.grades.project')}: {project?.title ?? t('common.unknown')}
                                </h3>
                            </div>
                            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground font-medium">
                                <span className="flex items-center gap-1.5">
                                    <AlertCircle className="w-4 h-4" />
                                    {t('committee.grades.supervisor')}: <span className="text-foreground">{project?.supervisor?.name || (project?.supervisorId ? `#${project.supervisorId}` : t('common.unknown'))}</span>
                                </span>
                                <span className="w-1 h-1 rounded-full bg-border" />
                                <span className="flex items-center gap-1.5">
                                    <Users className="w-4 h-4" />
                                    {t('committee.grades.committeeMembers')}: <span className="text-foreground">{committeeMemberCount}</span>
                                </span>
                                <span className="w-1 h-1 rounded-full bg-border" />
                                <span className="flex items-center gap-1.5">
                                    {anyPublished ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : allApproved ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-amber-500" />}
                                    {t('common.status')}: <span className={anyPublished ? "text-emerald-600" : allApproved ? "text-emerald-600" : "text-amber-600"}>
                                        {anyPublished ? t('committee.grades.published') : allApproved ? t('committee.grades.approved') : `${pendingCount} ${t('committee.grades.pending')}`}
                                    </span>
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mr-4" onClick={(e) => e.stopPropagation()}>
                            {pendingCount > 0 && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm(t('committee.grades.confirmApproveAll') || `Are you sure you want to approve all ${pendingCount} pending grades for this project?`)) {
                                            onStageAction('approve');
                                        }
                                    }}
                                    className="h-8 px-3 shadow-sm active:scale-95 transition-all bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    {t('committee.grades.approveAll')}
                                </Button>
                            )}

                            {!anyPublished && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!allApproved) return
                                        if (window.confirm(t('committee.grades.confirmPublish') || 'Are you sure you want to publish the results to students? This action cannot be undone.')) {
                                            onStageAction('publish');
                                        }
                                    }}
                                    disabled={!allApproved}
                                    title={!allApproved ? (t('committee.grades.approveFirstToPublish') || 'Approve all grades before publishing') : undefined}
                                    className="h-8 px-3 shadow-sm active:scale-95 transition-all w-fit"
                                >
                                    {t('committee.grades.publishSelected')}
                                </Button>
                            )}
                        </div>

                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-muted text-muted-foreground">
                                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                </CardHeader>

                <CollapsibleContent>
                    <CardContent className="p-0 border-t">
                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <Table className="min-w-[700px]">
                                <TableHeader className="bg-muted/30">
                                    <TableRow className="hover:bg-transparent border-b border-border/50">
                                        <TableHead className="w-[200px] pl-6 font-semibold">{t('committee.grades.student')}</TableHead>
                                        <TableHead className="text-center font-semibold">{t('committee.grades.supervisorGrade')}</TableHead>

                                        {memberColumns.map((num) => (
                                            <TableHead key={num} className="text-center font-semibold whitespace-nowrap">
                                                {t('committee.grades.committeeMember')} {num}
                                            </TableHead>
                                        ))}

                                        <TableHead className="text-center font-semibold">{t('committee.grades.committeeTotal')}</TableHead>
                                        <TableHead className="text-center font-semibold">{t('committee.grades.adjustment')}</TableHead>
                                        <TableHead className="text-center font-semibold">{t('committee.grades.finalGrade')}</TableHead>
                                        <TableHead className="text-center font-semibold">{t('common.status')}</TableHead>
                                        <TableHead className="text-center font-semibold w-[140px]">{t('common.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {grades.map((grade) => (
                                        <StudentGradeRow
                                            key={grade.id}
                                            grade={grade}
                                            onAction={onAction}
                                            onAdjustmentSave={onAdjustmentSave}
                                            stage={stage}
                                            committeeMemberCount={committeeMemberCount}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible >
    )
}
