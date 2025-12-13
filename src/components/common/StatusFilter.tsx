import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export interface FilterOption {
  value: string
  label: string
  count?: number
}

interface StatusFilterProps {
  options: FilterOption[]
  value: string[]
  onChange: (values: string[]) => void
  multiple?: boolean
  className?: string
}

export function StatusFilter({
  options,
  value,
  onChange,
  multiple = true,
  className,
}: StatusFilterProps) {
  const handleToggle = (optionValue: string) => {
    if (multiple) {
      if (value.includes(optionValue)) {
        onChange(value.filter((v) => v !== optionValue))
      } else {
        onChange([...value, optionValue])
      }
    } else {
      onChange([optionValue])
    }
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => {
        const isSelected = value.includes(option.value)
        return (
          <Button
            key={option.value}
            type="button"
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleToggle(option.value)}
            className="relative"
          >
            {option.label}
            {option.count !== undefined && (
              <span className="mr-1 rounded-full bg-primary/20 px-1.5 py-0.5 text-xs">
                {option.count}
              </span>
            )}
            {isSelected && (
              <Check className="mr-1 h-3 w-3" />
            )}
          </Button>
        )
      })}
    </div>
  )
}

