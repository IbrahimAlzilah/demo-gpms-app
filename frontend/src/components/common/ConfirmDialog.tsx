import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'

interface ConfirmDialogProps {
  open: boolean
  onClose?: () => void
  onOpenChange?: (open: boolean) => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
  icon?: ReactNode
  children?: ReactNode
}

export function ConfirmDialog({
  open,
  onClose,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = 'default',
  icon,
  children,
}: ConfirmDialogProps) {
  const { t } = useTranslation()
  const defaultConfirmLabel = confirmLabel || t('common.confirm')
  const defaultCancelLabel = cancelLabel || t('common.cancel')
  const handleClose = () => {
    onOpenChange?.(false)
    onClose?.()
  }

  const handleConfirm = () => {
    onConfirm()
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {icon || (
              <div className="rounded-full bg-destructive/10 p-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
            )}
            <DialogTitle>{title}</DialogTitle>
          </div>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children && <div className="py-4">{children}</div>}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            {defaultCancelLabel}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
          >
            {defaultConfirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

