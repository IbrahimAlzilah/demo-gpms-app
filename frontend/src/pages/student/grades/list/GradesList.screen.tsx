import { useTranslation } from 'react-i18next'
import { CardDescription, Badge } from '@/components/ui'
import { LoadingSpinner, EmptyState } from '@/components/common'
import {
  Award,
  User,
  Users,
  Clock,
  AlertCircle,
  MessageSquare,
  TrendingUp,
} from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import { useGradesList } from './GradesList.hook'

export function GradesList() {
  const { t } = useTranslation()
  const { data } = useGradesList()

  if (data.isLoading) {
    return <LoadingSpinner />
  }

  if (data.error) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <span>{t('grades.loadError')}</span>
      </div>
    )
  }

  if (!data.grades || data.grades.length === 0) {
    return (
      <EmptyState
        icon={Award}
        title={t('grades.noGrades')}
        description={t('grades.noGradesDescription')}
      />
    )
  }

  return (
    <>
      {/* UC-ST-08: Students can only view approved grades - filter toggle removed */}
      <div className="space-y-1">
        {data.grades.map((grade) => (
          <div key={grade.id}>
            <div className="flex items-center justify-between">
              {/* <CardTitle className="flex items-center gap-2">{t('grades.title')}</CardTitle> */}
              {/* <Badge variant={grade.isApproved ? 'default' : 'secondary'}>
                {grade.isApproved ? t('grades.approved') : t('grades.notApproved')}
              </Badge> */}
            </div>
            {grade.project && <CardDescription>{grade.project.title}</CardDescription>}
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
                      (
                      {(
                        (grade.supervisorGrade.score / grade.supervisorGrade.maxScore) *
                        100
                      ).toFixed(1)}
                      %)
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
                      <p className="text-sm whitespace-pre-wrap">
                        {grade.supervisorGrade.comments}
                      </p>
                    </div>
                  )}
                  {grade.supervisorGrade.evaluatedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {t('grades.evaluatedAt')}:{' '}
                      {formatDate(grade.supervisorGrade.evaluatedAt)}
                    </p>
                  )}
                  {/* Criteria Breakdown */}
                  {grade.supervisorGrade.criteria &&
                    Object.keys(grade.supervisorGrade.criteria).length > 0 && (
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
                      (
                      {(
                        (grade.committeeGrade.score / grade.committeeGrade.maxScore) *
                        100
                      ).toFixed(1)}
                      %)
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
                      <p className="text-sm whitespace-pre-wrap">
                        {grade.committeeGrade.comments}
                      </p>
                    </div>
                  )}
                  {grade.committeeGrade.evaluatedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {t('grades.evaluatedAt')}: {formatDate(grade.committeeGrade.evaluatedAt)}
                    </p>
                  )}
                  {grade.committeeGrade.committeeMembers &&
                    grade.committeeGrade.committeeMembers.length > 0 && (
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
                  {grade.committeeGrade.criteria &&
                    Object.keys(grade.committeeGrade.criteria).length > 0 && (
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
              {grade.finalGrade !== undefined && grade.finalGrade !== null && (
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

              {/* FD1 Grade */}
              {grade.fd1Published && (
                <div className="pt-6 border-t mt-6">
                  <h3 className="text-lg font-bold mb-4">{t('status.ready_for_fd1')}</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* FD1 Supervisor */}
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold text-sm">{t('grades.supervisorGrade')}</h4>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-primary">
                          {grade.fd1SupervisorScore?.toFixed(2) ?? '-'}
                        </p>
                        <span className="text-sm text-muted-foreground">/ 100</span>
                      </div>
                    </div>

                    {/* FD1 Committee */}
                    <div className="p-4 bg-success/5 rounded-lg border border-success/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-success" />
                        <h4 className="font-semibold text-sm">{t('grades.committeeGrade')}</h4>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-success">
                          {grade.fd1CommitteeScore?.toFixed(2) ?? '-'}
                        </p>
                        <span className="text-sm text-muted-foreground">/ 100</span>
                      </div>

                      {grade.fd1GradeBreakdown?.committeeMembers && grade.fd1GradeBreakdown.committeeMembers.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-success/10 space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground">{t('grades.committeeMembers')}</p>
                          {grade.fd1GradeBreakdown.committeeMembers.map((member, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <span>{member.evaluatorName}</span>
                              <span className="font-medium text-success">{Number(member.rawScore).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* FD1 Final */}
                  {grade.fd1FinalGrade !== undefined && grade.fd1FinalGrade !== null && (
                    <div className="mt-4 p-4 bg-accent/5 rounded-lg border border-accent/20">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{t('grades.total')}</h4>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold text-foreground">
                            {grade.fd1FinalGrade.toFixed(2)}
                          </p>
                          <span className="text-sm text-muted-foreground">/ 100</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* FD2 Grade */}
              {grade.fd2Published && (
                <div className="pt-6 border-t mt-6">
                  <h3 className="text-lg font-bold mb-4">{t('status.ready_for_fd2')}</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* FD2 Supervisor */}
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold text-sm">{t('grades.supervisorGrade')}</h4>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-primary">
                          {grade.fd2SupervisorScore?.toFixed(2) ?? '-'}
                        </p>
                        <span className="text-sm text-muted-foreground">/ 100</span>
                      </div>
                    </div>

                    {/* FD2 Committee */}
                    <div className="p-4 bg-success/5 rounded-lg border border-success/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-success" />
                        <h4 className="font-semibold text-sm">{t('grades.committeeGrade')}</h4>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-success">
                          {grade.fd2CommitteeScore?.toFixed(2) ?? '-'}
                        </p>
                        <span className="text-sm text-muted-foreground">/ 100</span>
                      </div>

                      {grade.fd2GradeBreakdown?.committeeMembers && grade.fd2GradeBreakdown.committeeMembers.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-success/10 space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground">{t('grades.committeeMembers')}</p>
                          {grade.fd2GradeBreakdown.committeeMembers.map((member, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <span>{member.evaluatorName}</span>
                              <span className="font-medium text-success">{Number(member.rawScore).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* FD2 Final */}
                  {grade.fd2FinalGrade !== undefined && grade.fd2FinalGrade !== null && (
                    <div className="mt-4 p-4 bg-accent/5 rounded-lg border border-accent/20">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{t('grades.total')}</h4>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold text-foreground">
                            {grade.fd2FinalGrade.toFixed(2)}
                          </p>
                          <span className="text-sm text-muted-foreground">/ 100</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!grade.isApproved && !grade.fd1Published && !grade.fd2Published && (
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
    </>
  )
}
