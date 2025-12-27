import { type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useDirection } from '@/hooks/use-direction'

interface DropdownMenuProps {
  children: ReactNode
  isOpen: boolean
  onClose: () => void
  className?: string
  align?: 'start' | 'end'
}

export function DropdownMenu({
  children,
  isOpen,
  onClose,
  className,
  align,
}: DropdownMenuProps) {
  const isRtl = useDirection()
  const alignment = align ?? (isRtl ? 'end' : 'start')

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'absolute top-full z-50 mt-2 rounded-md border border-border bg-popover text-popover-foreground p-1 shadow-md',
          alignment === 'end' ? 'end-0' : 'start-0',
          className
        )}
      >
        {children}
      </div>
    </>
  )
}

interface DropdownMenuItemProps {
  children: ReactNode
  onClick: () => void
  isActive?: boolean
  className?: string
}

export function DropdownMenuItem({
  children,
  onClick,
  isActive = false,
  className,
}: DropdownMenuItemProps) {
  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className={cn('w-full justify-start gap-2', className)}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

