import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { LoadingSpinner, StatusBadge } from '@/components/common'
import { Award, User, Users, CheckCircle2 } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import type { Grade } from '@/types/evaluation.types'

interface FinalGradesSectionProps {
  grades?: Grade[]
  isLoading?: boolean
}

export function FinalGradesSection({ grades, isLoading }: FinalGradesSectionProps) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (!grades || grades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            {t('supervisor.finalGrades')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            {t('supervisor.noFinalGrades')}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          {t('supervisor.finalGrades')} ({grades.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {grades.map((grade) => (
            <div
              key={grade.id}
              className="p-4 rounded-lg border bg-card"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-semibold">
                    {grade.student?.name || t('supervisor.student')}
                  </h4>
                </div>
                {grade.isApproved && (
                  <StatusBadge status="approved" />
                )}
              </div>

              <div className="space-y-3">
                {/* Supervisor Grade */}
                {grade.supervisorGrade && (
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{t('grades.supervisorGrade')}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary">
                        {grade.supervisorGrade.score}
                      </span>
                      <span className="text-muted-foreground">
                        / {grade.supervisorGrade.maxScore}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({((grade.supervisorGrade.score / grade.supervisorGrade.maxScore) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    {grade.supervisorGrade.comments && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {grade.supervisorGrade.comments}
                      </p>
                    )}
                  </div>
                )}

                {/* Committee Grade */}
                {grade.committeeGrade && (
                  <div className="p-3 bg-secondary/5 rounded-lg border border-secondary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-secondary-foreground" />
                      <span className="text-sm font-medium">{t('grades.committeeGrade')}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-secondary-foreground">
                        {grade.committeeGrade.score}
                      </span>
                      <span className="text-muted-foreground">
                        / {grade.committeeGrade.maxScore}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({((grade.committeeGrade.score / grade.committeeGrade.maxScore) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    {grade.committeeGrade.comments && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {grade.committeeGrade.comments}
                      </p>
                    )}
                  </div>
                )}

                {/* Final Grade */}
                {grade.finalGrade && (
                  <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium">{t('grades.finalGrade')}</span>
                      {grade.isApproved && (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-success">
                        {grade.finalGrade.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground">/ 100</span>
                    </div>
                    {grade.approvedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {t('grades.approvedAt')}: {formatDate(grade.approvedAt)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
