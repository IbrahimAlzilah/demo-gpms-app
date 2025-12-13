import { MainLayout } from '../../layouts/MainLayout'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

export function ReportsPage() {
  const handleGenerateReport = (type: string) => {
    // In real app, this would generate and download a report
    console.log(`Generating ${type} report...`)
    alert(`سيتم توليد تقرير ${type}`)
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
            <Button onClick={() => handleGenerateReport('projects')}>
              توليد التقرير
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-2">تقرير الطلاب</h3>
            <p className="text-sm text-muted-foreground mb-4">
              تقرير عن الطلاب ومشاريعهم
            </p>
            <Button onClick={() => handleGenerateReport('students')}>
              توليد التقرير
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-2">تقرير التقييمات</h3>
            <p className="text-sm text-muted-foreground mb-4">
              تقرير عن التقييمات والدرجات
            </p>
            <Button onClick={() => handleGenerateReport('evaluations')}>
              توليد التقرير
            </Button>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

