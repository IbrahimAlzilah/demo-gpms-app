import { X, User, Calendar, Users, Award, CheckCircle2, Clock, Check, AlertCircle } from "lucide-react"
import { formatDateTime } from "@/lib/utils/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Grade, GradeBreakdown } from "@/types/evaluation.types"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EnhancedGradeDetailsViewProps {
    grade: Grade
    onClose: () => void
    stage?: 'fd1' | 'fd2'
    onApprove?: () => void
    canApprove?: boolean
    validationErrors?: string[]
}

export function EnhancedGradeDetailsView({ 
    grade, 
    onClose, 
    stage, 
    onApprove, 
    canApprove = false,
    validationErrors = []
}: EnhancedGradeDetailsViewProps) {
    const { t } = useTranslation()

    // Get grade breakdown if available
    const breakdown: GradeBreakdown | undefined = grade.gradeBreakdown

    // Helper to extract stage-specific data
    const getStageData = () => {
        if (stage === 'fd1') {
            return {
                final: grade.fd1FinalGrade,
                isApproved: grade.fd1Approved
            }
        } else if (stage === 'fd2') {
            return {
                final: grade.fd2FinalGrade,
                isApproved: grade.fd2Approved
            }
        }
        // Default/Legacy
        return {
            final: grade.finalGrade,
            isApproved: grade.isApproved
        }
    }

    const stageData = getStageData()
    const finalGrade = breakdown?.finalGrade ?? stageData.final
    const isApproved = stageData.isApproved

    return (
        <div className="flex flex-col h-full max-h-[90vh]">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b">
                <div className="space-y-1">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        {t('committee.grades.student')}: <span className="text-primary">{grade.student?.name} ({grade.student?.studentId})</span>
                    </h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="font-medium">{t('committee.grades.project')}:</span> {grade.project?.title}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {t('committee.grades.group')}: {grade.project?.assignedGroupId || '-'}
                        </span>
                        {stage && (
                            <Badge variant="outline" className="text-xs">
                                {stage.toUpperCase()}
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {onApprove && !isApproved && (
                        <Button
                            onClick={onApprove}
                            disabled={!canApprove}
                            className={cn("gap-2", canApprove ? "bg-green-600 hover:bg-green-700 text-white" : "")}
                        >
                            <Check className="h-4 w-4" />
                            {t('common.approve')}
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                    {/* Validation Errors */}
                    {validationErrors.length > 0 && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="font-semibold mb-2">Missing Required Evaluations:</div>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    {validationErrors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Supervisor Evaluation */}
                    {breakdown?.supervisor && (
                        <Card className="overflow-hidden shadow-sm border-muted">
                            <CardHeader className="bg-amber-50/50 pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-semibold text-amber-800">
                                        <User className="h-4 w-4 inline mr-2" />
                                        Supervisor Evaluation
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-sm bg-white">
                                            {breakdown.supervisor.normalizedScore.toFixed(1)} / 100
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">{breakdown.supervisor.evaluatorName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {breakdown.supervisor.createdAt && formatDateTime(breakdown.supervisor.createdAt)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-muted-foreground mb-1">Raw Score</div>
                                        <Badge variant="secondary" className="text-sm font-semibold">
                                            {breakdown.supervisor.rawScore} / {breakdown.supervisor.maxScore}
                                        </Badge>
                                    </div>
                                </div>

                                <Separator />

                                <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-xs text-amber-700 font-medium">Contribution Formula</div>
                                            <div className="text-sm text-amber-900 font-mono mt-1">{breakdown.supervisor.formula}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-amber-700 font-medium">Contribution</div>
                                            <div className="text-2xl font-bold text-amber-900">{breakdown.supervisor.contribution.toFixed(2)}</div>
                                        </div>
                                    </div>
                                </div>

                                {breakdown.supervisor.notes && (
                                    <div className="space-y-1">
                                        <span className="text-xs font-medium text-muted-foreground">Notes:</span>
                                        <p className="text-sm leading-relaxed text-slate-700 bg-slate-50 p-3 rounded-md">
                                            {breakdown.supervisor.notes}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Committee Member Evaluations */}
                    {breakdown && breakdown.committeeMembers.length > 0 && (
                        <Card className="overflow-hidden shadow-sm border-muted">
                            <CardHeader className="bg-blue-50/50 pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-semibold text-blue-800">
                                        <Users className="h-4 w-4 inline mr-2" />
                                        Discussion Committee Evaluations ({breakdown.committeeMembers.length} members)
                                    </CardTitle>
                                    <div className="text-right">
                                        <div className="text-xs text-blue-700 font-medium">Total Contribution</div>
                                        <div className="text-2xl font-bold text-blue-900">{breakdown.committeeContribution.toFixed(2)}</div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                {breakdown.committeeMembers.map((member, index) => (
                                    <div key={member.id} className="border rounded-lg p-4 bg-slate-50/50">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs">Member {index + 1}</Badge>
                                                    <p className="text-sm font-medium">{member.evaluatorName}</p>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {member.createdAt && formatDateTime(member.createdAt)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-muted-foreground mb-1">Raw Score</div>
                                                <Badge variant="secondary" className="text-sm font-semibold">
                                                    {member.rawScore} / {member.maxScore}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 p-2 rounded border border-blue-200 flex items-center justify-between">
                                            <div>
                                                <div className="text-xs text-blue-700">Formula: {member.formula}</div>
                                                <div className="text-xs text-blue-600 mt-0.5">Normalized: {member.normalizedScore.toFixed(1)}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-blue-700">Contribution</div>
                                                <div className="text-lg font-bold text-blue-900">{member.contribution.toFixed(2)}</div>
                                            </div>
                                        </div>

                                        {member.notes && (
                                            <div className="mt-2">
                                                <p className="text-xs text-muted-foreground mb-1">Notes:</p>
                                                <p className="text-xs text-slate-700 bg-white p-2 rounded border">
                                                    {member.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Project Committee Evaluations (Adjustments) */}
                    {breakdown && breakdown.projectCommitteeMembers.length > 0 && (
                        <Card className="overflow-hidden shadow-sm border-purple-200">
                            <CardHeader className="bg-purple-50/50 pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-semibold text-purple-800">
                                        <Award className="h-4 w-4 inline mr-2" />
                                        Project Committee Adjustments ({breakdown.projectCommitteeMembers.length})
                                    </CardTitle>
                                    <div className="text-right">
                                        <div className="text-xs text-purple-700 font-medium">Total Contribution</div>
                                        <div className="text-2xl font-bold text-purple-900">{breakdown.projectCommitteeContribution.toFixed(2)}</div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                {breakdown.projectCommitteeMembers.map((member, index) => (
                                    <div key={member.id} className="border border-purple-200 rounded-lg p-4 bg-purple-50/30">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs border-purple-300">Adjustment {index + 1}</Badge>
                                                    <p className="text-sm font-medium">{member.evaluatorName}</p>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {member.createdAt && formatDateTime(member.createdAt)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-muted-foreground mb-1">Raw Score</div>
                                                <Badge variant="secondary" className="text-sm font-semibold">
                                                    {member.rawScore} / {member.maxScore}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="bg-purple-100 p-2 rounded border border-purple-300 flex items-center justify-between">
                                            <div>
                                                <div className="text-xs text-purple-700">Formula: {member.formula}</div>
                                                <div className="text-xs text-purple-600 mt-0.5">Normalized: {member.normalizedScore.toFixed(1)}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-purple-700">Contribution</div>
                                                <div className="text-lg font-bold text-purple-900">{member.contribution.toFixed(2)}</div>
                                            </div>
                                        </div>

                                        {member.notes && (
                                            <div className="mt-2">
                                                <p className="text-xs text-muted-foreground mb-1">Notes:</p>
                                                <p className="text-xs text-slate-700 bg-white p-2 rounded border">
                                                    {member.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Final Grade Summary */}
                    <Card className="overflow-hidden shadow-lg border-2 border-primary/20">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Contributions Breakdown */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-sm text-foreground mb-4">Grade Contributions</h3>
                                    
                                    {breakdown?.supervisor && (
                                        <div className="flex justify-between items-center p-2 bg-amber-50 rounded">
                                            <span className="text-sm text-amber-800">Supervisor</span>
                                            <span className="text-sm font-bold text-amber-900">{breakdown.supervisorContribution.toFixed(2)}</span>
                                        </div>
                                    )}

                                    {breakdown && breakdown.committeeMembers.length > 0 && (
                                        <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                            <span className="text-sm text-blue-800">Committee ({breakdown.committeeMembers.length} members)</span>
                                            <span className="text-sm font-bold text-blue-900">{breakdown.committeeContribution.toFixed(2)}</span>
                                        </div>
                                    )}

                                    {breakdown && breakdown.projectCommitteeMembers.length > 0 && (
                                        <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                                            <span className="text-sm text-purple-800">Project Committee</span>
                                            <span className="text-sm font-bold text-purple-900">{breakdown.projectCommitteeContribution.toFixed(2)}</span>
                                        </div>
                                    )}

                                    {(breakdown as { adjustment?: number })?.adjustment != null && (breakdown as { adjustment?: number }).adjustment !== 0 && (
                                        <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                            <span className="text-sm text-slate-800">Optional Adjustment</span>
                                            <span className="text-sm font-bold text-slate-900">{(breakdown as { adjustment?: number }).adjustment!.toFixed(2)}</span>
                                        </div>
                                    )}

                                    <Separator className="my-2" />

                                    <div className="flex justify-between items-center p-3 bg-primary/5 rounded font-semibold">
                                        <span className="text-sm">Total Final Grade</span>
                                        <span className="text-xl font-bold text-primary">{finalGrade != null ? Number(finalGrade).toFixed(2) : '-'}</span>
                                    </div>
                                </div>

                                {/* Approval Status */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-sm text-foreground mb-4">Approval Status</h3>
                                    
                                    <div className="space-y-2">
                                        <Badge variant={isApproved ? "default" : "secondary"} className={cn(
                                            "w-full justify-center py-2 gap-2",
                                            isApproved ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-300" : ""
                                        )}>
                                            {isApproved ? (
                                                <><CheckCircle2 className="h-4 w-4" /> {t('committee.grades.approved')}</>
                                            ) : (
                                                <><Clock className="h-4 w-4" /> {t('committee.grades.pending')}</>
                                            )}
                                        </Badge>

                                        {grade.approvedAt && (
                                            <div className="text-xs text-muted-foreground bg-slate-50 p-2 rounded">
                                                <div>{t('committee.grades.approvedAt')}: {formatDateTime(grade.approvedAt)}</div>
                                                {grade.approvedBy && <div className="mt-1">{t('committee.grades.approvedBy')}: {grade.approvedBy}</div>}
                                            </div>
                                        )}

                                        {!isApproved && canApprove && (
                                            <Alert>
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription className="text-xs">
                                                    {validationErrors.length > 0 
                                                        ? "Cannot approve: Missing required evaluations above." 
                                                        : "All evaluations submitted. Ready for approval."}
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
