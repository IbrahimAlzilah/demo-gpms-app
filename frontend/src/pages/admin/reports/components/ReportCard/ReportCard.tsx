import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { ReportCardProps } from '../../types/Reports.types'

export function ReportCard({
  title,
  description,
  type,
  isLoading,
  onGenerate,
}: ReportCardProps) {
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <Button onClick={() => onGenerate(type)} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            جاري التوليد...
          </>
        ) : (
          'توليد التقرير'
        )}
      </Button>
    </Card>
  )
}
