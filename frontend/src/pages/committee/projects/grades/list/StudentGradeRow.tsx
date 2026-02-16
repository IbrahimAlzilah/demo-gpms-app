import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { User, Eye, Edit2, Check, Loader2 } from 'lucide-react'
import { TableRow, TableCell, Badge, Input } from '@/components/ui'
import { ActionsDropdown, type TableAction } from '@/components/common'
import type { Grade } from '@/types/evaluation.types'

interface StudentGradeRowProps {
    grade: Grade
    onAction: (grade: Grade, action: 'approve' | 'edit' | 'view') => void
    onAdjustmentSave?: (grade: Grade, value: number | null) => Promise<void>
    stage: 'fd1' | 'fd2'
    committeeMemberCount: number
}

export function StudentGradeRow({ grade, onAction, onAdjustmentSave, stage, committeeMemberCount }: StudentGradeRowProps) {
    const { t } = useTranslation()
    const [adjustmentInput, setAdjustmentInput] = useState<string>('')
    const [isEditingAdjustment, setIsEditingAdjustment] = useState(false)
    const [savingAdjustment, setSavingAdjustment] = useState(false)

    const currentAdjustment = stage === 'fd1' ? (grade as { fd1Adjustment?: number | null }).fd1Adjustment : (grade as { fd2Adjustment?: number | null }).fd2Adjustment

    const handleAdjustmentBlur = useCallback(async () => {
        if (!onAdjustmentSave || !isEditingAdjustment) return
        setIsEditingAdjustment(false)
        const trimmed = adjustmentInput.trim()
        const val = trimmed === '' ? null : parseFloat(trimmed)
        if (trimmed !== '' && (isNaN(val!) || val! < -100 || val! > 100)) return
        const finalVal = trimmed === '' ? null : val!
        if (finalVal === currentAdjustment || (finalVal === null && currentAdjustment == null)) return
        setSavingAdjustment(true)
        try {
            await onAdjustmentSave(grade, finalVal)
        } finally {
            setSavingAdjustment(false)
        }
    }, [adjustmentInput, currentAdjustment, grade, isEditingAdjustment, onAdjustmentSave])

    const handleAdjustmentFocus = useCallback(() => {
        setIsEditingAdjustment(true)
        setAdjustmentInput(currentAdjustment != null ? String(currentAdjustment) : '')
    }, [currentAdjustment])

    // Use stage-specific grade breakdown from backend (committeeEvaluations with defenseStage)
    const stageBreakdown = (stage === 'fd1' ? grade.fd1GradeBreakdown : grade.fd2GradeBreakdown) ?? undefined
    const committeeEvals = (Array.isArray(grade.committeeEvaluations) ? grade.committeeEvaluations : [])
        .filter((e: { defenseStage?: string }) => e.defenseStage === stage)
        .sort((a: { evaluatorName?: string }, b: { evaluatorName?: string }) => (a.evaluatorName || '').localeCompare(b.evaluatorName || ''))

    // Supervisor: use strict stage breakdown
    // Do NOT fallback to generic supervisorEvaluation/supervisorGrade which may belong to another stage
    const supervisorEval = stageBreakdown?.supervisor
    const rawSupervisorScore = supervisorEval
        ? ((supervisorEval as { rawScore?: number }).rawScore ?? (supervisorEval as { score?: number }).score)
        : (stage === 'fd1' ? grade.fd1SupervisorScore : grade.fd2SupervisorScore)

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
    // Check if stageBreakdown has actual data (not just an empty object)
    const hasStageBreakdownData = stageBreakdown && (
        stageBreakdown.committeeContribution > 0 ||
        (stageBreakdown.committeeMembers && stageBreakdown.committeeMembers.length > 0)
    )

    // Use aggregate committee score when: no evals, no stage breakdown, or contributions are 0 (legacy/synthesized)
    const existingTotal = (stage === 'fd1' ? grade.fd1CommitteeScore : grade.fd2CommitteeScore)
        ?? grade.committeeGrade?.score
        ?? grade.committeeScore
    if (existingTotal != null && (committeeEvals.length === 0 && !hasStageBreakdownData || committeeTotalContribution === 0)) {
        committeeTotalContribution = existingTotal
    }

    const stageApprovalStatus = stage === 'fd1' ? (grade as { fd1ApprovalStatus?: string }).fd1ApprovalStatus : (grade as { fd2ApprovalStatus?: string }).fd2ApprovalStatus
    const isStagePublished = stage === 'fd1' ? grade.fd1Published : grade.fd2Published

    let calculatedFinal = (stage === 'fd1' ? grade.fd1FinalGrade : grade.fd2FinalGrade)
    if (calculatedFinal == null && stageBreakdown?.finalGrade != null) calculatedFinal = stageBreakdown.finalGrade

    // Only calculate from contributions if we have actual stage-specific breakdown data
    const canCalculate = hasStageBreakdownData && (rawSupervisorScore != null || committeeTotalContribution > 0)

    // Use live adjustment input if editing
    if (canCalculate && (isEditingAdjustment || savingAdjustment)) {
        const liveAdjustment = adjustmentInput.trim() === '' ? 0 : parseFloat(adjustmentInput)
        if (!isNaN(liveAdjustment)) {
            calculatedFinal = (stageBreakdown?.supervisorContribution ?? 0) + committeeTotalContribution + liveAdjustment
        }
    }

    if (calculatedFinal == null && canCalculate) {
        calculatedFinal = (stageBreakdown?.supervisorContribution ?? 0) + committeeTotalContribution + (stageBreakdown?.projectCommitteeContribution ?? 0)
    }

    // Fall back to general finalGrade if no stage-specific calculation exists
    if (calculatedFinal == null || calculatedFinal === 0) {
        calculatedFinal = grade.finalGrade
    }

    const memberScoresIndices = Array.from({ length: committeeMemberCount }, (_, i) => i)

    // const isStageLocked = isStagePublished || stageApprovalStatus === 'approved' // Unused with hidden: true

    // Project Committee can always edit (including after publish, with audit trail)
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
        },
        {
            id: 'approve',
            label: t('common.approve'),
            icon: Check,
            onClick: (row) => onAction(row, 'approve'),
            hidden: () => true, // Individual approval not supported for Defense Stages (use Project Approve All)
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
                        <span className="font-medium text-sm text-foreground">
                            {grade.student?.name ?? grade.studentId ?? '—'}
                        </span>
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

            <TableCell className="text-center">
                {onAdjustmentSave && !isStagePublished ? (
                    <div className="flex items-center justify-center gap-1">
                        {savingAdjustment ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : isEditingAdjustment ? (
                            <Input
                                type="number"
                                min={-100}
                                max={100}
                                step="0.01"
                                value={adjustmentInput}
                                onChange={(e) => setAdjustmentInput(e.target.value)}
                                onBlur={handleAdjustmentBlur}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdjustmentBlur()}
                                className="h-8 w-20 text-center text-sm"
                                placeholder="0"
                                autoFocus
                            />
                        ) : (
                            <button
                                type="button"
                                onClick={handleAdjustmentFocus}
                                className="min-w-16 px-2 py-1 rounded border border-dashed border-muted-foreground/40 hover:border-primary/50 hover:bg-muted/50 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                title={t('committee.grades.adjustment')}
                            >
                                {currentAdjustment != null ? Number(currentAdjustment).toFixed(2) : '—'}
                            </button>
                        )}
                    </div>
                ) : (
                    <span className="text-muted-foreground">
                        {currentAdjustment != null ? Number(currentAdjustment).toFixed(2) : '—'}
                    </span>
                )}
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
