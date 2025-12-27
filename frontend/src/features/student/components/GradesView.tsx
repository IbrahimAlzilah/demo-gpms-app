import { useTranslation } from 'react-i18next'
import { CardTitle, CardDescription, Badge } from '@/components/ui'
import { LoadingSpinner, EmptyState } from '@/components/common'
import {
  Award, User, Users, Clock, AlertCircle,
  MessageSquare, TrendingUp
} from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import type { Grade } from '@/types/evaluation.types'

interface GradesViewProps {
  grades: Grade[] | undefined
  isLoading: boolean
  error: Error | null
}

export function GradesView({ grades, isLoading, error }: GradesViewProps) {
  const { t } = useTranslation()

  if (isLoading) {
    return (<LoadingSpinner />)
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <span>{t('grades.loadError')}</span>
      </div>
    )
  }

  if (!grades || grades.length === 0) {
    return (
      <EmptyState
        icon={Award}
        title={t('grades.noGrades')}
        description={t('grades.noGradesDescription')}
      />
    )
  }

  return (
    <div className="space-y-6">
      {grades.map((grade) => (
        <div key={grade.id}>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="flex items-center gap-2">
              {t('grades.title')}
            </CardTitle>
            <Badge variant={grade.isApproved ? 'default' : 'secondary'}>
              {grade.isApproved
                ? (t('grades.approved'))
                : (t('grades.notApproved'))
              }
            </Badge>
          </div>
          {grade.project && (
            <CardDescription>{grade.project.title}</CardDescription>
          )}
          <div className="space-y-6">
            {/* Supervisor Grade */}
            {grade.supervisorGrade && (
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">{t('grades.supervisorGrade')}</h4>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-3xl font-bold text-primary">
                    {grade.supervisorGrade.score}
                  </p>
                  <span className="text-lg text-muted-foreground">
                    / {grade.supervisorGrade.maxScore}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({((grade.supervisorGrade.score / grade.supervisorGrade.maxScore) * 100).toFixed(1)}%)
                  </span>
                </div>
                {grade.supervisorGrade.comments && (
                  <div className="mt-3 p-3 bg-card rounded border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs font-medium text-muted-foreground">
                        {t('grades.comments')}
                      </p>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{grade.supervisorGrade.comments}</p>
                  </div>
                )}
                {grade.supervisorGrade.evaluatedAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('grades.evaluatedAt')}: {formatDate(grade.supervisorGrade.evaluatedAt)}
                  </p>
                )}
                {/* Criteria Breakdown */}
                {grade.supervisorGrade.criteria && Object.keys(grade.supervisorGrade.criteria).length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t('grades.criteriaBreakdown')}
                    </p>
                    {Object.entries(grade.supervisorGrade.criteria).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{key}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Committee Grade */}
            {grade.committeeGrade && (
              <div className="p-4 bg-success/5 rounded-lg border border-success/20">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-success" />
                  <h4 className="font-semibold">{t('grades.committeeGrade')}</h4>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-3xl font-bold text-success">
                    {grade.committeeGrade.score}
                  </p>
                  <span className="text-lg text-muted-foreground">
                    / {grade.committeeGrade.maxScore}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({((grade.committeeGrade.score / grade.committeeGrade.maxScore) * 100).toFixed(1)}%)
                  </span>
                </div>
                {grade.committeeGrade.comments && (
                  <div className="mt-3 p-3 bg-card rounded border border-border">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs font-medium text-muted-foreground">
                        {t('grades.comments')}
                      </p>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{grade.committeeGrade.comments}</p>
                  </div>
                )}
                {grade.committeeGrade.evaluatedAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('grades.evaluatedAt')}: {formatDate(grade.committeeGrade.evaluatedAt)}
                  </p>
                )}
                {grade.committeeGrade.committeeMembers && grade.committeeGrade.committeeMembers.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {t('grades.committeeMembers')}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {grade.committeeGrade.committeeMembers.map((memberId, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {memberId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {/* Criteria Breakdown */}
                {grade.committeeGrade.criteria && Object.keys(grade.committeeGrade.criteria).length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t('grades.criteriaBreakdown')}
                    </p>
                    {Object.entries(grade.committeeGrade.criteria).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{key}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Final Grade */}
            {grade.finalGrade !== undefined && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  <h4 className="font-semibold text-lg">{t('grades.finalGrade')}</h4>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-accent">
                    {grade.finalGrade.toFixed(2)}
                  </p>
                  <span className="text-lg text-muted-foreground">/ 100</span>
                </div>
                {grade.approvedAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('grades.approvedAt')}: {formatDate(grade.approvedAt)}
                  </p>
                )}
              </div>
            )}

            {!grade.isApproved && (
              <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <Clock className="h-4 w-4 text-warning mt-0.5" />
                <p className="text-sm text-warning-foreground">
                  {t('grades.notApprovedMessage')}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

