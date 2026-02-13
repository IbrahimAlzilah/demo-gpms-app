import { X, User, Calendar, Users, Award, CheckCircle2, Clock } from "lucide-react"
import { formatDateTime } from "@/lib/utils/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Grade } from "@/types/evaluation.types"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

interface GradeDetailsViewProps {
    grade: Grade
    onClose: () => void
    stage?: 'fd1' | 'fd2'
}

export function GradeDetailsView({ grade, onClose, stage }: GradeDetailsViewProps) {
    const { t } = useTranslation()

    // Helper to extract stage-specific data
    const getStageData = () => {
        if (stage === 'fd1') {
            return {
                supScore: grade.fd1SupervisorScore,
                comScore: grade.fd1CommitteeScore,
                final: grade.fd1FinalGrade,
                isApproved: grade.isFd1Approved
            }
        } else if (stage === 'fd2') {
            return {
                supScore: grade.fd2SupervisorScore,
                comScore: grade.fd2CommitteeScore,
                final: grade.fd2FinalGrade,
                isApproved: grade.isFd2Approved
            }
        }
        // Default/Legacy
        return {
            supScore: grade.supervisorScore ?? grade.supervisorGrade?.score,
            comScore: grade.committeeScore ?? grade.committeeGrade?.score,
            final: grade.finalGrade,
            isApproved: grade.isApproved
        }
    }

    const stageData = getStageData()

    // Supervisor Data
    const supervisorGrade = grade.supervisorGrade
    const supervisorScore = stageData.supScore ?? supervisorGrade?.score
    const supervisorMax = supervisorGrade?.maxScore ?? 100

    // Committee Data
    const committeeGrade = grade.committeeGrade
    const committeeScore = stageData.comScore ?? committeeGrade?.score
    const committeeMax = committeeGrade?.maxScore ?? 100

    // Final Data
    const finalGrade = stageData.final
    const isApproved = stageData.isApproved

    return (
        <div className="flex flex-col h-full max-h-[85vh]">
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
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {t('common.updated')}: {formatDateTime(grade.updatedAt)}
                        </span>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Supervisor Grade Card */}
                    <Card className="overflow-hidden shadow-sm border-muted">
                        <CardHeader className="bg-muted/30 pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-semibold text-primary">
                                    {t('committee.grades.supervisorGrade')}
                                </CardTitle>
                                <Badge variant={supervisorScore != null ? "secondary" : "outline"} className="text-base font-bold bg-amber-50 text-amber-700 border-amber-200">
                                    {supervisorScore != null ? Number(supervisorScore).toFixed(0) : '-'} <span className="text-xs font-normal text-muted-foreground mx-1">/</span> {supervisorMax}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                <Badge variant="outline" className="bg-slate-50 font-normal gap-1">
                                    {t('common.date')}: {formatDateTime(supervisorGrade?.evaluatedAt)}
                                </Badge>
                                <Badge variant="outline" className="bg-slate-50 font-normal gap-1">
                                    {t('common.by')}: {supervisorGrade?.evaluatedBy || '-'}
                                </Badge>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <span className="text-xs font-medium text-muted-foreground block">{t('committee.grades.comments')}:</span>
                                <p className="text-sm leading-relaxed text-slate-700 bg-slate-50 p-3 rounded-md min-h-[60px]">
                                    {supervisorGrade?.comments || t('common.noComments')}
                                </p>
                            </div>

                            <div className="text-xs text-muted-foreground text-end">
                                {t('committee.grades.criteriaItems', { count: 0 })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Committee Grade Card */}
                    <Card className="overflow-hidden shadow-sm border-muted">
                        <CardHeader className="bg-muted/30 pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-semibold text-blue-700">
                                    {t('committee.grades.committeeGrade')}
                                </CardTitle>
                                <Badge variant={committeeScore != null ? "secondary" : "outline"} className="text-base font-bold bg-blue-50 text-blue-700 border-blue-200">
                                    {committeeScore != null ? Number(committeeScore).toFixed(0) : '-'} <span className="text-xs font-normal text-muted-foreground mx-1">/</span> {committeeMax}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                <Badge variant="outline" className="bg-slate-50 font-normal gap-1">
                                    {t('common.date')}: {formatDateTime(committeeGrade?.evaluatedAt)}
                                </Badge>
                                <Badge variant="outline" className="bg-slate-50 font-normal gap-1">
                                    {t('common.by')}: {committeeGrade?.evaluatedBy || '-'}
                                </Badge>
                            </div>

                            {committeeGrade?.committeeMembers && (
                                <div className="text-xs text-muted-foreground">
                                    Members: {committeeGrade.committeeMembers.join(', ')}
                                </div>
                            )}

                            <Separator />

                            <div className="space-y-2">
                                <span className="text-xs font-medium text-muted-foreground block">{t('committee.grades.comments')}:</span>
                                <p className="text-sm leading-relaxed text-slate-700 bg-slate-50 p-3 rounded-md min-h-[60px]">
                                    {committeeGrade?.comments || t('common.noComments')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Final Grade & Approval - Full Width */}
                    <Card className="md:col-span-2 overflow-hidden shadow-sm border-muted bg-slate-50/50">
                        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex flex-col gap-1">
                                <h3 className="font-semibold text-sm text-foreground">{t('committee.grades.approvalAndFinal')}</h3>
                                <div className="flex gap-2 items-center">
                                    <Badge variant={isApproved ? "success" : "secondary"} className={cn("gap-1", isApproved ? "bg-green-100 text-green-700 hover:bg-green-200" : "")}>
                                        {isApproved ? (
                                            <><CheckCircle2 className="h-3 w-3" /> {t('committee.grades.approved')}</>
                                        ) : (
                                            <><Clock className="h-3 w-3" /> {t('committee.grades.pending')}</>
                                        )}
                                    </Badge>
                                    <Badge variant="outline" className="gap-1 border-blue-200 bg-blue-50 text-blue-700">
                                        {t('committee.grades.ready')}: {grade.isReadyForApproval ? t('common.yes') : t('common.no')}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-center px-6 py-2 bg-white rounded-lg border shadow-sm">
                                    <span className="block text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">{t('committee.grades.finalGrade')}</span>
                                    <span className="text-2xl font-black text-primary">
                                        {finalGrade != null ? Number(finalGrade).toFixed(2) : '-'} <span className="text-sm font-normal text-muted-foreground">/ 100</span>
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground min-w-[150px]">
                                {grade.approvedAt && (
                                    <div>{t('committee.grades.approvedAt')}: {formatDateTime(grade.approvedAt)}</div>
                                )}
                                {grade.approvedBy && (
                                    <div>{t('committee.grades.approvedBy')}: {grade.approvedBy}</div>
                                )}
                                <div>{t('common.updated')}: {formatDateTime(grade.updatedAt)}</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
