import { toast, Toaster as SonnerToaster } from "sonner"
import { useTranslation } from "react-i18next"
import { useThemeStore } from "@/stores/theme.store"
import React from "react"

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

  const toastSuccess = (message: string, options?: any) => {
    toast.success(t(message), {
      duration: 3000,
      ...options,
    })
  }

  const toastError = (message: string, options?: any) => {
    const translated = t(message)
    const truncated = truncateErrorMessage(translated)

    toast.error(truncated, {
      duration: 5000,
      ...options,
    })
  }

  const toastWarning = (message: string, options?: any) => {
    toast.warning(t(message), {
      duration: 4000,
      ...options,
    })
  }

  const toastInfo = (message: string, options?: any) => {
    toast.info(t(message), {
      duration: 3000,
      ...options,
    })
  }

  return {
    toast,
    toastSuccess,
    toastError,
    toastWarning,
    toastInfo,
    dismiss: toast.dismiss,
  }
}

export function Toaster() {
  const { theme } = useThemeStore()
  const { i18n } = useTranslation()
  return (
    <SonnerToaster
      dir={i18n.dir() === 'rtl' ? 'rtl' : 'ltr'}
      position={i18n.dir() === 'rtl' ? 'top-left' : 'top-right'}
      richColors
      closeButton
      theme={theme} // Or use theme context if available, but system is safe default
      className="toaster-group"
      style={{ fontFamily: 'var(--font-expo-arabic)' } as React.CSSProperties}
      toastOptions={{
        style: { fontFamily: 'var(--font-expo-arabic)' } as React.CSSProperties,
        classNames: {
          toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg font-expo-arabic',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
    />
  )
}
