import { LAYOUT_CONSTANTS, responsivePadding, responsiveSpacing } from './constants'
import { cn } from '@/lib/utils'

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className={cn(
        'container mx-auto w-full',
        LAYOUT_CONSTANTS.containerMaxWidth,
        responsivePadding.footer,
        responsiveSpacing.footer
      )}>
        <p className="text-center text-xs sm:text-sm text-muted-foreground px-2">
          © {new Date().getFullYear()} نظام إدارة تقييم مشاريع التخرج. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  )
}

