import { useTranslation } from 'react-i18next'
import { useGrades } from '../hooks/useGrades'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { LoadingSpinner } from '../../../components/common/LoadingSpinner'
import { EmptyState } from '../../../components/common/EmptyState'
import { Badge } from '../../../components/ui/badge'
import { 
  Award, User, Users, CheckCircle2, Clock, AlertCircle, Printer, Download, 
  FileText, MessageSquare, TrendingUp
} from 'lucide-react'
import { formatDate } from '../../../lib/utils/format'

export function GradesView() {
  const { t } = useTranslation()
  const { data: grades, isLoading, error } = useGrades()

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    if (!grades || grades.length === 0) return
    
    const content = grades.map((grade) => {
      let text = t('grades.title') || 'الدرجات\n'
      text += '========\n\n'
      if (grade.supervisorGrade) {
        text += `${t('grades.supervisorGrade') || 'درجة المشرف'}: ${grade.supervisorGrade.score} / ${grade.supervisorGrade.maxScore}\n`
        if (grade.supervisorGrade.comments) {
          text += `${t('grades.comments') || 'ملاحظات'}: ${grade.supervisorGrade.comments}\n`
        }
      }
      if (grade.committeeGrade) {
        text += `${t('grades.committeeGrade') || 'درجة لجنة المناقشة'}: ${grade.committeeGrade.score} / ${grade.committeeGrade.maxScore}\n`
        if (grade.committeeGrade.comments) {
          text += `${t('grades.comments') || 'ملاحظات'}: ${grade.committeeGrade.comments}\n`
        }
      }
      if (grade.finalGrade) {
        text += `${t('grades.finalGrade') || 'الدرجة النهائية'}: ${grade.finalGrade.toFixed(2)}\n`
      }
      text += `${t('grades.status') || 'الحالة'}: ${grade.isApproved ? (t('grades.approved') || 'معتمدة') : (t('grades.notApproved') || 'غير معتمدة')}\n`
      return text
    }).join('\n---\n\n')

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `grades-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('grades.loadError') || 'حدث خطأ أثناء تحميل الدرجات'}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!grades || grades.length === 0) {
    return (
      <EmptyState
        icon={Award}
        title={t('grades.noGrades') || 'لا توجد درجات متاحة حالياً'}
        description={t('grades.noGradesDescription') || 'لم يتم تقييم مشروعك بعد'}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          {t('grades.print') || 'طباعة'}
        </Button>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          {t('grades.export') || 'تصدير'}
        </Button>
      </div>

      {grades.map((grade) => (
        <Card key={grade.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                {t('grades.title') || 'الدرجات'}
              </CardTitle>
              <Badge variant={grade.isApproved ? 'default' : 'secondary'}>
                {grade.isApproved 
                  ? (t('grades.approved') || 'معتمدة')
                  : (t('grades.notApproved') || 'غير معتمدة')
                }
              </Badge>
            </div>
            {grade.project && (
              <CardDescription>{grade.project.title}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Supervisor Grade */}
            {grade.supervisorGrade && (
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">{t('grades.supervisorGrade') || 'درجة المشرف'}</h4>
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
                        {t('grades.comments') || 'ملاحظات'}
                      </p>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{grade.supervisorGrade.comments}</p>
                  </div>
                )}
                {grade.supervisorGrade.evaluatedAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('grades.evaluatedAt') || 'تم التقييم في'}: {formatDate(grade.supervisorGrade.evaluatedAt)}
                  </p>
                )}
                {/* Criteria Breakdown */}
                {grade.supervisorGrade.criteria && Object.keys(grade.supervisorGrade.criteria).length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t('grades.criteriaBreakdown') || 'تفصيل المعايير'}
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
                  <h4 className="font-semibold">{t('grades.committeeGrade') || 'درجة لجنة المناقشة'}</h4>
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
                        {t('grades.comments') || 'ملاحظات'}
                      </p>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{grade.committeeGrade.comments}</p>
                  </div>
                )}
                {grade.committeeGrade.evaluatedAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('grades.evaluatedAt') || 'تم التقييم في'}: {formatDate(grade.committeeGrade.evaluatedAt)}
                  </p>
                )}
                {grade.committeeGrade.committeeMembers && grade.committeeGrade.committeeMembers.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {t('grades.committeeMembers') || 'أعضاء اللجنة'}
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
                      {t('grades.criteriaBreakdown') || 'تفصيل المعايير'}
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
                  <h4 className="font-semibold text-lg">{t('grades.finalGrade') || 'الدرجة النهائية'}</h4>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-accent">
                    {grade.finalGrade.toFixed(2)}
                  </p>
                  <span className="text-lg text-muted-foreground">/ 100</span>
                </div>
                {grade.approvedAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('grades.approvedAt') || 'تم الاعتماد في'}: {formatDate(grade.approvedAt)}
                  </p>
                )}
              </div>
            )}

            {!grade.isApproved && (
              <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <Clock className="h-4 w-4 text-warning mt-0.5" />
                <p className="text-sm text-warning-foreground">
                  {t('grades.notApprovedMessage') || 'النتائج لم تعتمد بعد'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

