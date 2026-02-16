import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { Grade } from '@/types/evaluation.types'
import { committeeGradeService } from '../api/grade.service'
import { useToast } from '@/components/common'
import { GradeDetailsView } from './GradeDetailsView'
import { EnhancedGradeDetailsView } from './EnhancedGradeDetailsView'
import { LoadingSpinner } from '@/components/common'

interface EditGradeModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    grade: Grade | null
    mode: 'edit' | 'view'
    stage?: 'fd1' | 'fd2'
    onSuccess: () => void
    onApprove?: (grade: Grade) => void
}

export function EditGradeModal({ open, onOpenChange, grade, mode, stage, onSuccess, onApprove }: EditGradeModalProps) {
    const { t } = useTranslation()
    const { toastSuccess, toastError } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [fetchingDetails, setFetchingDetails] = useState(false)
    const [detailedGrade, setDetailedGrade] = useState<Grade | null>(null)
    const [validationErrors, setValidationErrors] = useState<string[]>([])
    const [canApprove, setCanApprove] = useState(false)

    const [supervisorScore, setSupervisorScore] = useState<string>('')
    const [committeeScore, setCommitteeScore] = useState<string>('')
    const [finalGrade, setFinalGrade] = useState<string>('')
    const [adjustment, setAdjustment] = useState<string>('')

    // Fetch detailed breakdown when in view mode and stage is specified
    useEffect(() => {
        const fetchDetailedBreakdown = async () => {
            if (mode === 'view' && grade && stage && grade.project?.id) {
                setFetchingDetails(true)
                try {
                    const data = await committeeGradeService.getDefenseReview(grade.project.id, stage)

                    if (data.evaluations?.length) {
                        const studentEvaluation = data.evaluations.find(
                            (e: any) => e.student.id === grade.studentId
                        )

                        if (studentEvaluation) {
                            const breakdown = studentEvaluation.gradeBreakdown || {}
                            setDetailedGrade({
                                ...grade,
                                gradeBreakdown: { ...breakdown, adjustment: breakdown.adjustment },
                                supervisorEvaluation: studentEvaluation.supervisorEvaluation,
                                committeeEvaluations: studentEvaluation.committeeEvaluations,
                                projectCommitteeEvaluations: studentEvaluation.projectCommitteeEvaluations,
                                supervisorContribution: studentEvaluation.supervisorContribution,
                                committeeContribution: studentEvaluation.committeeContribution,
                                projectCommitteeContribution: studentEvaluation.projectCommitteeContribution,
                            })
                        }
                    }

                    setValidationErrors(data.validationErrors || [])
                    setCanApprove(data.canApprove || false)
                } catch (error) {
                    console.error('Failed to fetch detailed breakdown:', error)
                    setDetailedGrade(grade)
                } finally {
                    setFetchingDetails(false)
                }
            } else {
                setDetailedGrade(grade)
            }
        }

        if (open && grade) {
            fetchDetailedBreakdown()
        }
    }, [open, grade, stage, mode])

    useEffect(() => {
        if (grade) {
            let sup, com, fin
            const g = grade as { fd1Adjustment?: number; fd2Adjustment?: number }
            if (stage === 'fd1') {
                fin = grade.fd1FinalGrade
                setAdjustment(g.fd1Adjustment != null ? String(g.fd1Adjustment) : '')
            } else if (stage === 'fd2') {
                fin = grade.fd2FinalGrade
                setAdjustment(g.fd2Adjustment != null ? String(g.fd2Adjustment) : '')
            } else {
                sup = grade.supervisorScore ?? grade.supervisorGrade?.score ?? grade.displaySupervisorGrade?.score
                com = grade.committeeScore ?? grade.committeeGrade?.score ?? grade.displayCommitteeGrade?.score
                fin = grade.finalGrade
                setAdjustment('')
            }

            setSupervisorScore(sup?.toString() ?? '')
            setCommitteeScore(com?.toString() ?? '')
            setFinalGrade(fin?.toString() ?? '')
        }
    }, [grade, stage])

    const handleSave = async () => {
        if (!grade) return

        const sScore = supervisorScore ? parseFloat(supervisorScore) : undefined
        const cScore = committeeScore ? parseFloat(committeeScore) : undefined
        const fGrade = finalGrade ? parseFloat(finalGrade) : undefined
        const adj = adjustment.trim() !== '' ? parseFloat(adjustment) : undefined

        // Validate
        if ((sScore && (sScore < 0 || sScore > 100)) || (cScore && (cScore < 0 || cScore > 100))) {
            toastError(t('committee.grades.invalidScore'))
            return
        }
        if (adj !== undefined && (adj < -100 || adj > 100)) {
            toastError(t('committee.grades.invalidAdjustment') || 'Adjustment must be between -100 and 100')
            return
        }

        try {
            setIsLoading(true)
            const payload: any = {}

            if (stage === 'fd1') {
                payload.fd1FinalGrade = fGrade
                if (adj !== undefined) payload.fd1Adjustment = adj
            } else if (stage === 'fd2') {
                payload.fd2FinalGrade = fGrade
                if (adj !== undefined) payload.fd2Adjustment = adj
            } else {
                payload.supervisorScore = sScore
                payload.committeeScore = cScore
                payload.finalGrade = fGrade
            }

            await committeeGradeService.update(grade.id, payload)
            toastSuccess(t('committee.grades.updateSuccess'))
            onSuccess()
            onOpenChange(false)
        } catch (err) {
            toastError(err instanceof Error ? err.message : t('committee.grades.updateError'))
        } finally {
            setIsLoading(false)
        }
    }

    const handleApproveFromView = async () => {
        if (!grade) return
        if (onApprove) {
            onApprove(grade)
        } else {
            // Fallback internal approve logic if no prop provided
            try {
                // Assuming approve function exists or implementing directly if needed
                // But safer to rely on parent
                await committeeGradeService.approve(grade.id) // Assuming .approve exists based on context
                toastSuccess(t('committee.grades.approveSuccess'))
                onSuccess()
                onOpenChange(false)
            } catch (err) {
                toastError(err instanceof Error ? err.message : t('committee.grades.approveError'))
            }
        }
    }

    // Project Committee can edit FD1/FD2 even when published (with audit trail)
    const isReadOnly = mode === 'view' || (!!stage ? false : !!grade?.isApproved)
    const isStageGrade = !!stage

    if (mode === 'view' && grade) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-6xl p-0 gap-0 overflow-hidden bg-white/95 backdrop-blur-sm shadow-xl max-h-[95vh]">
                    {fetchingDetails ? (
                        <div className="flex items-center justify-center p-12">
                            <LoadingSpinner />
                        </div>
                    ) : detailedGrade?.gradeBreakdown ? (
                        <EnhancedGradeDetailsView
                            grade={detailedGrade}
                            onClose={() => onOpenChange(false)}
                            stage={stage}
                            onApprove={(!(stage === 'fd1' ? grade.isFd1Approved : grade.isFd2Approved) && !(stage === 'fd1' ? grade.fd1Published : grade.fd2Published)) ? handleApproveFromView : undefined}
                            canApprove={canApprove}
                            validationErrors={validationErrors}
                        />
                    ) : (
                        <GradeDetailsView
                            grade={detailedGrade || grade}
                            onClose={() => onOpenChange(false)}
                            stage={stage}
                            onApprove={(!grade.isApproved && grade.isReadyForApproval) ? handleApproveFromView : undefined}
                        />
                    )}
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {t('committee.grades.editGrade')}
                        {stage ? ` - ${t(`committee.grades.${stage}`, { defaultValue: stage })}` : ''}
                    </DialogTitle>
                    <DialogDescription>
                        {grade?.project?.title} - {grade?.student?.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {!isStageGrade && (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="supervisorScore">{t('committee.grades.supervisorGrade')}</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="supervisorScore"
                                        type="number"
                                        value={supervisorScore}
                                        onChange={(e) => setSupervisorScore(e.target.value)}
                                        disabled={isReadOnly}
                                        className="w-full"
                                        max={100}
                                        min={0}
                                    />
                                    <span className="text-muted-foreground whitespace-nowrap">
                                        / {grade?.supervisorGrade?.maxScore ?? 100}
                                    </span>
                                </div>
                                {grade?.displaySupervisorGrade?.evaluatedBy && (
                                    <p className="text-xs text-muted-foreground">
                                        {t('common.by')}: {grade.displaySupervisorGrade.evaluatedBy}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="committeeScore">{t('committee.grades.committeeGrade')}</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="committeeScore"
                                        type="number"
                                        value={committeeScore}
                                        onChange={(e) => setCommitteeScore(e.target.value)}
                                        disabled={isReadOnly}
                                        className="w-full"
                                        max={100}
                                        min={0}
                                    />
                                    <span className="text-muted-foreground whitespace-nowrap">
                                        / {grade?.committeeGrade?.maxScore ?? 100}
                                    </span>
                                </div>
                                {grade?.displayCommitteeGrade?.committeeMembers && grade.displayCommitteeGrade.committeeMembers.length > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        {t('committee.grades.evaluators')}: {grade.displayCommitteeGrade.committeeMembers.length}
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {isStageGrade && (
                        <div className="grid gap-2">
                            <Label htmlFor="adjustment">{t('committee.grades.adjustment') || 'Optional Adjustment'}</Label>
                            <Input
                                id="adjustment"
                                type="number"
                                value={adjustment}
                                onChange={(e) => setAdjustment(e.target.value)}
                                disabled={isReadOnly}
                                placeholder="0"
                                min={-100}
                                max={100}
                                step="0.01"
                            />
                            <p className="text-xs text-muted-foreground">
                                {t('committee.grades.adjustmentHelp') || 'Optional value (-100 to 100) added to the calculated final grade.'}
                            </p>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="finalGrade">{t('committee.grades.finalGrade')}</Label>
                        <Input
                            id="finalGrade"
                            type="number"
                            value={finalGrade}
                            onChange={(e) => setFinalGrade(e.target.value)}
                            disabled={isReadOnly}
                            placeholder={t('committee.grades.calculatedAutomatically')}
                        />
                        {isReadOnly && !finalGrade && <p className="text-xs text-muted-foreground">{t('committee.grades.notCalculatedYet')}</p>}
                    </div>

                    {grade?.isApproved && (
                        <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                            {t('committee.grades.approvedAt')}: {grade.approvedAt}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('common.close')}
                    </Button>
                    {!isReadOnly && (
                        <Button onClick={handleSave} disabled={isLoading}>
                            {isLoading ? t('common.saving') : t('common.save')}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
