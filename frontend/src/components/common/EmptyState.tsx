import type { ReactNode, ComponentType } from 'react'
import type { SVGProps } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  image?: string
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
  children?: ReactNode
}

export function EmptyState({
  icon: Icon,
  image,
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      {Icon && (
        <div className="mb-4 rounded-full bg-muted p-3">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      {image && (
        <div className="mb-3">
          <img src={image} alt="Empty State" className="object-cover h-14 w-auto opacity-90" />
        </div>
      )}
      {title && <h3 className="mb-2 text-base font-semibold text-muted-foreground">{title}</h3>}
      {description && (
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="default">
          {action.label}
        </Button>
      )}
      {children}
    </div>
  )
}

