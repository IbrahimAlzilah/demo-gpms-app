import { useTranslation } from 'react-i18next'
import { User, Eye, Edit2, Check } from 'lucide-react'
import { TableRow, TableCell, Badge } from '@/components/ui'
import { ActionsDropdown, type TableAction } from '@/components/common'
import type { Grade } from '@/types/evaluation.types'

interface StudentGradeRowProps {
    grade: Grade
    onAction: (grade: Grade, action: 'approve' | 'edit' | 'view') => void
    stage: 'fd1' | 'fd2'
    committeeMemberCount: number
}

export function StudentGradeRow({ grade, onAction, stage, committeeMemberCount }: StudentGradeRowProps) {
    const { t } = useTranslation()

    // Use stage-specific grade breakdown from backend (committeeEvaluations with defenseStage)
    const stageBreakdown = stage === 'fd1' ? grade.fd1GradeBreakdown : grade.fd2GradeBreakdown
    const committeeEvals = (grade.committeeEvaluations ?? [])
        .filter((e: { defenseStage?: string }) => e.defenseStage === stage)
        .sort((a: { evaluatorName?: string }, b: { evaluatorName?: string }) => (a.evaluatorName || '').localeCompare(b.evaluatorName || ''))

    // Supervisor: use breakdown or fallback to general supervisorGrade
    const supervisorEval = stageBreakdown?.supervisor ?? grade.supervisorEvaluation
    const rawSupervisorScore = supervisorEval
        ? ((supervisorEval as { rawScore?: number }).rawScore ?? (supervisorEval as { score?: number }).score)
        : (stage === 'fd1' ? grade.fd1SupervisorScore : grade.fd2SupervisorScore)
        ?? grade.supervisorGrade?.score
        ?? grade.supervisorScore

    // Contributions: Formula (grade/100)/5 for committee, (grade/100)/2 for supervisor
    // Backend sends contribution already scaled to 0-100
    const supervisorContribution = stageBreakdown?.supervisorContribution ?? (rawSupervisorScore != null ? (rawSupervisorScore / 100) / 2 * 100 : 0)

    let committeeTotalContribution = stageBreakdown?.committeeContribution ?? 0
    const committeeMemberScores = Array.from({ length: committeeMemberCount }, (_, i) => {
        const evalItem = committeeEvals[i] as { rawScore?: number; score?: number; contribution?: number } | undefined
        if (evalItem) {
            const raw = evalItem.rawScore ?? evalItem.score ?? 0
            const contribution = evalItem.contribution ?? (raw / 100) / 5 * 100
            if (committeeTotalContribution === 0 && !stageBreakdown) committeeTotalContribution += contribution
            return { raw, contribution }
        }
        return null
    })

    // Fall back to general committeeGrade or stage-specific score if no evaluations exist
    if (committeeEvals.length === 0 && !stageBreakdown) {
        const existingTotal = (stage === 'fd1' ? grade.fd1CommitteeScore : grade.fd2CommitteeScore)
            ?? grade.committeeGrade?.score
            ?? grade.committeeScore
        if (existingTotal != null) committeeTotalContribution = existingTotal
    }

    const stageApprovalStatus = stage === 'fd1' ? (grade as { fd1ApprovalStatus?: string }).fd1ApprovalStatus : (grade as { fd2ApprovalStatus?: string }).fd2ApprovalStatus
    const isStagePublished = stage === 'fd1' ? grade.fd1Published : grade.fd2Published

    let calculatedFinal = (stage === 'fd1' ? grade.fd1FinalGrade : grade.fd2FinalGrade)
    if (calculatedFinal == null && stageBreakdown?.finalGrade != null) calculatedFinal = stageBreakdown.finalGrade
    if (calculatedFinal == null && (rawSupervisorScore != null || committeeEvals.length > 0)) {
        calculatedFinal = (stageBreakdown?.supervisorContribution ?? 0) + committeeTotalContribution + (stageBreakdown?.projectCommitteeContribution ?? 0)
    }

    const memberScoresIndices = Array.from({ length: committeeMemberCount }, (_, i) => i)

    const isStageLocked = isStagePublished || stageApprovalStatus === 'approved'

    const actions: TableAction<Grade>[] = [
        {
            id: 'view',
            label: t('common.view'),
            icon: Eye,
            onClick: (row) => onAction(row, 'view'),
        },
        {
            id: 'edit',
            label: t('common.edit'),
            icon: Edit2,
            onClick: (row) => onAction(row, 'edit'),
            hidden: () => isStageLocked,
        },
        {
            id: 'approve',
            label: t('common.approve'),
            icon: Check,
            onClick: (row) => onAction(row, 'approve'),
            hidden: () => isStageLocked,
            disabled: (row) => !row.isReadyForApproval,
            variant: 'success',
        }
    ]

    return (
        <TableRow className="hover:bg-muted/5">
            <TableCell className="text-start">
                <div className="flex items-center justify-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                        <span className="font-medium text-sm text-foreground">{grade.student?.name}</span>
                        {/* <span className="text-xs text-muted-foreground">{grade.student?.department}</span> */}
                    </div>
                </div>
            </TableCell>

            <TableCell className="text-center font-medium">
                {rawSupervisorScore != null ? (
                    <div className="flex flex-col items-center">
                        <span>{Number(rawSupervisorScore).toFixed(2)}</span>
                        <span className="text-[10px] text-muted-foreground hidden group-hover:block">
                            ({Number(supervisorContribution).toFixed(1)})
                        </span>
                    </div>
                ) : '-'}
            </TableCell>

            {memberScoresIndices.map((idx) => {
                const scoreData = committeeMemberScores[idx]
                return (
                    <TableCell key={idx} className="text-center text-muted-foreground">
                        {scoreData ? (
                            <div className="flex flex-col items-center text-foreground font-medium">
                                <span>{Number(scoreData.raw).toFixed(2)}</span>
                                <span className="text-[10px] text-muted-foreground hidden group-hover:block">
                                    ({Number(scoreData.contribution).toFixed(1)})
                                </span>
                            </div>
                        ) : '-'}
                    </TableCell>
                )
            })}

            <TableCell className="text-center font-medium bg-muted/5">
                {committeeTotalContribution > 0 ? Number(committeeTotalContribution).toFixed(2) : '-'}
            </TableCell>

            <TableCell className="text-center bg-muted/10">
                <div className="flex items-center justify-center font-bold text-foreground">
                    {calculatedFinal != null ? <span>{Number(calculatedFinal).toFixed(2)}</span> : '-'}
                </div>
            </TableCell>

            <TableCell className="text-center">
                {isStagePublished ? (
                    <Badge variant="outline" className="gap-1 border-emerald-600/20 text-emerald-600 bg-emerald-50 hover:bg-emerald-50">
                        {t('committee.grades.published')}
                    </Badge>
                ) : stageApprovalStatus === 'approved' ? (
                    <Badge variant="outline" className="gap-1 border-emerald-600/20 text-emerald-600 bg-emerald-50 hover:bg-emerald-50">
                        {t('committee.grades.approved')}
                    </Badge>
                ) : (
                    <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50">
                        {t('committee.grades.pending')}
                    </Badge>
                )}
            </TableCell>

            <TableCell className="text-center">
                <div className="flex items-center justify-center">
                    <ActionsDropdown row={grade} actions={actions} />
                </div>
            </TableCell>
        </TableRow>
    )
}
