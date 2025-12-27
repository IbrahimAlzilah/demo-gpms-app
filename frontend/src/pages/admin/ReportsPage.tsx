import { useState } from 'react'
import { MainLayout } from '../../layouts/MainLayout'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { reportService, type ReportType } from '../../features/admin/api/report.service'
import { useToast } from '../../components/common/NotificationToast'
import { Loader2 } from 'lucide-react'

export function ReportsPage() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)

  const handleGenerateReport = async (type: ReportType) => {
    setLoading(type)
    try {
      await reportService.downloadReport(type, { format: 'pdf' })
      showToast(`تم توليد تقرير ${type} بنجاح`, 'success')
    } catch (error) {
      console.error('Error generating report:', error)
      showToast(`فشل في توليد التقرير: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`, 'error')
    } finally {
      setLoading(null)
    }
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">إصدار التقارير</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <h3 className="font-semibold mb-2">تقرير المشاريع</h3>
            <p className="text-sm text-muted-foreground mb-4">
              تقرير شامل عن جميع المشاريع
            </p>
            <Button 
              onClick={() => handleGenerateReport('projects')}
              disabled={loading === 'projects'}
            >
              {loading === 'projects' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري التوليد...
                </>
              ) : (
                'توليد التقرير'
              )}
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-2">تقرير الطلاب</h3>
            <p className="text-sm text-muted-foreground mb-4">
              تقرير عن الطلاب ومشاريعهم
            </p>
            <Button 
              onClick={() => handleGenerateReport('students')}
              disabled={loading === 'students'}
            >
              {loading === 'students' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري التوليد...
                </>
              ) : (
                'توليد التقرير'
              )}
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-2">تقرير التقييمات</h3>
            <p className="text-sm text-muted-foreground mb-4">
              تقرير عن التقييمات والدرجات
            </p>
            <Button 
              onClick={() => handleGenerateReport('evaluations')}
              disabled={loading === 'evaluations'}
            >
              {loading === 'evaluations' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري التوليد...
                </>
              ) : (
                'توليد التقرير'
              )}
            </Button>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

