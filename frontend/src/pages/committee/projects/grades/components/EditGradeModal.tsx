import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { Grade } from '@/types/evaluation.types'
import { committeeGradeService } from '../api/grade.service'
import { useToast } from '@/components/common'

interface EditGradeModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    grade: Grade | null
    mode: 'edit' | 'view'
    onSuccess: () => void
}

export function EditGradeModal({ open, onOpenChange, grade, mode, onSuccess }: EditGradeModalProps) {
    const { t } = useTranslation()
    const { toastSuccess, toastError } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    const [supervisorScore, setSupervisorScore] = useState<string>('')
    const [committeeScore, setCommitteeScore] = useState<string>('')
    const [finalGrade, setFinalGrade] = useState<string>('')

    useEffect(() => {
        if (grade) {
            const sup = grade.supervisorScore ?? grade.supervisorGrade?.score ?? grade.displaySupervisorGrade?.score
            const com = grade.committeeScore ?? grade.committeeGrade?.score ?? grade.displayCommitteeGrade?.score
            const fin = grade.finalGrade

            setSupervisorScore(sup?.toString() ?? '')
            setCommitteeScore(com?.toString() ?? '')
            setFinalGrade(fin?.toString() ?? '')
        }
    }, [grade])

    const handleSave = async () => {
        if (!grade) return

        const sScore = supervisorScore ? parseFloat(supervisorScore) : undefined
        const cScore = committeeScore ? parseFloat(committeeScore) : undefined
        const fGrade = finalGrade ? parseFloat(finalGrade) : undefined

        // Validate
        if ((sScore && (sScore < 0 || sScore > 100)) || (cScore && (cScore < 0 || cScore > 100))) {
            toastError(t('committee.grades.invalidScore'))
            return
        }

        try {
            setIsLoading(true)
            await committeeGradeService.update(grade.id, {
                supervisorScore: sScore,
                committeeScore: cScore,
                finalGrade: fGrade
            })
            toastSuccess(t('committee.grades.updateSuccess'))
            onSuccess()
            onOpenChange(false)
        } catch (err) {
            toastError(err instanceof Error ? err.message : t('committee.grades.updateError'))
        } finally {
            setIsLoading(false)
        }
    }

    const isReadOnly = mode === 'view' || grade?.isApproved

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'view' ? t('committee.grades.viewDetails') : t('committee.grades.editGrade')}
                    </DialogTitle>
                    <DialogDescription>
                        {grade?.project?.title} - {grade?.student?.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
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
                                By: {grade.displaySupervisorGrade.evaluatedBy}
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
                                Evaluators: {grade.displayCommitteeGrade.committeeMembers.length}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="finalGrade">{t('committee.grades.finalGrade')}</Label>
                        <Input
                            id="finalGrade"
                            type="number"
                            value={finalGrade}
                            onChange={(e) => setFinalGrade(e.target.value)}
                            disabled={isReadOnly} // Typically computed, but allow override if needed or just display
                            placeholder="Calculated automatically"
                        />
                        {isReadOnly && !finalGrade && <p className="text-xs text-muted-foreground">Not calculated yet</p>}
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
