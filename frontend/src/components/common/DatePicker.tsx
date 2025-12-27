import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  label?: string
  value?: string
  onChange?: (value: string) => void
  min?: string
  max?: string
  required?: boolean
  disabled?: boolean
  className?: string
  error?: string
}

export function DatePicker({
  label,
  value,
  onChange,
  min,
  max,
  required,
  disabled,
  className,
  error,
}: DatePickerProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor="date-picker">
          {label}
          {required && <span className="text-destructive mr-1">*</span>}
        </Label>
      )}
      <div className="relative">
        <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          id="date-picker"
          type="date"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          min={min}
          max={max}
          required={required}
          disabled={disabled}
          className={cn(
            'pr-10',
            error && 'border-destructive focus-visible:ring-destructive'
          )}
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

