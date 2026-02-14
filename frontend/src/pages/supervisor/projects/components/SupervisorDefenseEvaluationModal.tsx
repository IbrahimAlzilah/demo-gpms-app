import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { evaluationService } from '@/pages/supervisor/evaluation/api/evaluation.service'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import {
    Card,
    CardContent,
    Button,
    Input,
    Label,
    Textarea,
    Badge,
} from '@/components/ui'
import { LoadingSpinner } from '@/components/common'
import { useToast } from '@/components/common'
import { AlertCircle, Loader2, User, CheckCircle2, Lock, ArrowLeft } from 'lucide-react'
import type { Project } from '@/types/project.types'

interface SupervisorDefenseEvaluationModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    project: Project | null
}

// Validation schema
const createEvaluationSchema = (t: (key: string) => string) => z.object({
    score: z.coerce
        .number({ message: t('supervisor.requiredField') })
        .min(0, t('supervisor.invalidGrade'))
        .max(100, t('supervisor.invalidGrade')),
    notes: z.string().optional(),
})

export function SupervisorDefenseEvaluationModal({
    open,
    onOpenChange,
    project,
}: SupervisorDefenseEvaluationModalProps) {
    const { t } = useTranslation()
    const { toastSuccess, toastError } = useToast()
    const queryClient = useQueryClient()
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)

    const currentStage = project?.defenseStage?.current || 'fd1'
    const isLocked = project?.defenseStage?.[currentStage === 'fd1' ? 'fd1Locked' : 'fd2Locked'] ?? false

    // Fetch evaluations for the current stage
    const { data: evaluationsData, isLoading: evaluationsLoading } = useQuery({
        queryKey: ['supervisor-defense-evaluations', project?.id, currentStage],
        queryFn: () => evaluationService.getDefenseEvaluations(project!.id, currentStage),
        enabled: open && !!project,
    })

    // Get selected student's evaluation
    const selectedStudentEvaluation = evaluationsData?.find(
        (e: any) => e.studentId === selectedStudentId
    )

    // Form setup
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm({
        resolver: zodResolver(createEvaluationSchema(t)),
        defaultValues: {
            score: 0,
            notes: '',
        },
    })

    // Load existing evaluation data when student is selected
    useEffect(() => {
        if (selectedStudentEvaluation?.supervisorGrade) {
            setValue('score', selectedStudentEvaluation.supervisorGrade.score)
            setValue('notes', selectedStudentEvaluation.supervisorGrade.comments || '')
        } else {
            reset()
        }
    }, [selectedStudentId, selectedStudentEvaluation, setValue, reset])

    // Submit mutation
    const submitMutation = useMutation({
        mutationFn: (data: { score: number; notes?: string }) =>
            evaluationService.submitDefenseEvaluation({
                projectId: project!.id,
                studentId: selectedStudentId!,
                defenseStage: currentStage,
                grade: {
                    score: data.score,
                    maxScore: 100,
                    criteria: {},
                    comments: data.notes,
                },
            }),
        onSuccess: () => {
            toastSuccess(t('supervisor.evaluationSubmitted'))
            queryClient.invalidateQueries({ queryKey: ['supervisor-defense-evaluations', project?.id, currentStage] })
            queryClient.invalidateQueries({ queryKey: ['supervisor-projects'] })
            setSelectedStudentId(null)
            reset()
        },
        onError: (error: any) => {
            toastError(error?.message || t('supervisor.evaluationFailed'))
        },
    })

    const onSubmit = async (data: { score: number; notes?: string }) => {
        if (isLocked) {
            toastError(t('supervisor.evaluationLockedMessage'))
            return
        }
        submitMutation.mutate(data)
    }

    const handleClose = () => {
        setSelectedStudentId(null)
        reset()
        onOpenChange(false)
    }

    if (!project) return null

    const students = project.students || []
    const stageLabel = t(`evaluation.${currentStage}`, { defaultValue: currentStage })

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {selectedStudentId
                            ? t('supervisor.evaluationForm')
                            : t('supervisor.selectStudentToEvaluate')
                        }
                        <Badge variant={currentStage === 'fd1' ? 'default' : 'secondary'}>
                            {stageLabel}
                        </Badge>
                        {isLocked && <Lock className="h-4 w-4 text-muted-foreground ml-auto" />}
                    </DialogTitle>
                    {!selectedStudentId && (
                        <DialogDescription>
                            {t('supervisor.selectStudentDescription')}
                        </DialogDescription>
                    )}
                </DialogHeader>

                {evaluationsLoading ? (
                    <div className="py-8">
                        <LoadingSpinner />
                    </div>
                ) : selectedStudentId ? (
                    // Evaluation Form
                    <div className="space-y-4">
                        {/* Back Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-2 text-muted-foreground"
                            onClick={() => {
                                setSelectedStudentId(null)
                                reset()
                            }}
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            {t('common.back')}
                        </Button>

                        {/* Student Info */}
                        <Card className="border-muted">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">
                                            {students.find(s => s.id === selectedStudentId)?.name || 'Unknown'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {students.find(s => s.id === selectedStudentId)?.email}
                                        </p>
                                    </div>
                                    {selectedStudentEvaluation?.supervisorGrade && (
                                        <Badge variant="default" className="bg-green-600">
                                            {t('supervisor.evaluated')}
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lock Warning */}
                        {isLocked && (
                            <Card className="border-warning/50 bg-warning/5">
                                <CardContent className="p-4 flex items-start gap-3">
                                    <Lock className="h-5 w-5 text-warning mt-0.5" />
                                    <div>
                                        <p className="font-medium text-warning">{t('supervisor.evaluationLocked')}</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {t('supervisor.evaluationLockedMessage')}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Evaluation Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="score">
                                    {t('supervisor.studentGrade')} *
                                </Label>
                                <Input
                                    id="score"
                                    type="number"
                                    step="0.01"
                                    {...register('score')}
                                    min="0"
                                    max="100"
                                    placeholder="0-100"
                                    disabled={isLocked}
                                    className={errors.score ? 'border-destructive' : ''}
                                    aria-invalid={!!errors.score}
                                />
                                {errors.score && (
                                    <p className="text-xs text-destructive flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.score.message}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    {t('supervisor.gradeRange')}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">
                                    {t('supervisor.notes')} ({t('common.optional')})
                                </Label>
                                <Textarea
                                    id="notes"
                                    {...register('notes')}
                                    placeholder={t('supervisor.notesPlaceholder')}
                                    rows={4}
                                    disabled={isLocked}
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    className="flex-1"
                                >
                                    {t('common.cancel')}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitMutation.isPending || isLocked}
                                    className="flex-1"
                                >
                                    {submitMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {t('common.saving')}
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            {selectedStudentEvaluation?.supervisorGrade
                                                ? t('supervisor.submitEvaluation')
                                                : t('supervisor.submitEvaluation')}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                ) : (
                    // Student Selection
                    <div className="space-y-3">
                        {students.map((student) => {
                            const evaluation = evaluationsData?.find((e: any) => e.studentId === student.id)
                            const hasEvaluation = !!evaluation?.supervisorGrade

                            return (
                                <Card
                                    key={student.id}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors border-muted"
                                    onClick={() => setSelectedStudentId(student.id)}
                                >
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{student.name}</p>
                                                {student.email && (
                                                    <p className="text-xs text-muted-foreground">{student.email}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {hasEvaluation ? (
                                                <>
                                                    <Badge variant="default" className="bg-green-600">
                                                        {evaluation?.supervisorGrade?.score ?? 0}/100
                                                    </Badge>
                                                    <Button variant="ghost" size="sm">
                                                        {isLocked ? t('common.view') : t('common.edit')}
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button variant="default" size="sm" disabled={isLocked}>
                                                    {t('nav.evaluation')}
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
