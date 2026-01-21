import { toast, Toaster as SonnerToaster } from "sonner"
import { useTranslation } from "react-i18next"

/**
 * Truncates long error messages to prevent UI clutter
 */
const truncateErrorMessage = (message: string, maxLength: number = 150): string => {
  if (!message) return ''
  if (message.length <= maxLength) return message
  return `${message.substring(0, maxLength)}...`
}

export function useToast() {
  const { t } = useTranslation()

  const success = (message: string) => {
    // If message is a key, t() translates it. If it's a raw string not in dict, t() returns it.
    toast.success(t(message), {
      duration: 3000,
    })
  }

  const error = (message: string) => {
    const translated = t(message)
    const truncated = truncateErrorMessage(translated)

    toast.error(truncated, {
      duration: 5000,
    })
  }

  const warning = (message: string) => {
    toast.warning(t(message), {
      duration: 4000,
    })
  }

  const info = (message: string) => {
    toast.info(t(message), {
      duration: 3000,
    })
  }

  return {
    toast,
    success,
    error,
    warning,
    info,
    // Backward compatibility aliases
    succeeded: success,
    failed: error,
    dismiss: toast.dismiss,
  }
}

export function Toaster() {
  const { i18n } = useTranslation()
  return (
    <SonnerToaster
      dir={i18n.dir() === 'rtl' ? 'rtl' : 'ltr'}
      position={i18n.dir() === 'rtl' ? 'top-left' : 'top-right'}
      richColors
      closeButton
      theme="system" // Or use theme context if available, but system is safe default
      className="toaster-group"
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
    />
  )
}
